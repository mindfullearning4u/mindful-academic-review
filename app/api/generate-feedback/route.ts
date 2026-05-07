import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  buildAdvancedPrompt,
  buildBasicPrompt,
  type FeedbackRequest,
} from "./prompt-builders";
import { getSubscriptionAccess } from "@/lib/subscription/access";
import { createClient } from "@/lib/supabase/server";
import { validateFeedbackRequest } from "@/lib/validation/feedback-request";

type OpenAITextContent = {
  type?: string;
  text?: string;
};

type OpenAIOutputItem = {
  content?: OpenAITextContent[];
};

type OpenAIResponse = {
  output_text?: string;
  output?: OpenAIOutputItem[];
  error?: {
    message?: string;
  };
};

const MODEL = "gpt-5.4-mini";
const GRADING_STANDARDS_PATH = path.join(
  process.cwd(),
  "grading-standards.md",
);

async function getGradingStandards() {
  return readFile(GRADING_STANDARDS_PATH, "utf8");
}

function extractFeedback(response: OpenAIResponse) {
  if (response.output_text) {
    return response.output_text;
  }

  const textParts = response.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean);

  return textParts?.join("\n\n") ?? "";
}

async function logUsageEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  request: FeedbackRequest,
  success: boolean,
  errorCode?: string,
) {
  await supabase.from("usage_events").insert({
    event_type: "feedback_generation",
    service_tier: request.serviceTier,
    assignment_type: request.assignmentType,
    citation_style: request.citationStyle,
    prompt_char_count: request.assignmentPrompt.length,
    requirements_char_count: request.assignmentRequirements.length,
    rubric_char_count: request.rubric.length,
    submission_char_count: request.studentSubmission.length,
    feedback_focus: request.feedbackFocus,
    success,
    error_code: errorCode,
  });
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const access = await getSubscriptionAccess(supabase, user.id, user.email);

  if (!access.hasAccess) {
    return Response.json(
      { error: "Subscription access is not active." },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = validateFeedbackRequest(body);

  if ("error" in parsed) {
    return Response.json(
      { error: parsed.error, details: parsed.details },
      { status: 400 },
    );
  }

  let gradingStandards: string;

  try {
    gradingStandards = await getGradingStandards();
  } catch {
    await logUsageEvent(supabase, parsed.request, false, "grading_standards");
    return Response.json(
      { error: "Unable to load grading standards." },
      { status: 500 },
    );
  }

  const prompt =
    parsed.request.serviceTier === "Basic"
      ? buildBasicPrompt(parsed.request, gradingStandards)
      : buildAdvancedPrompt(parsed.request, gradingStandards);

  let openAIResponse: Response;
  let data: OpenAIResponse;

  try {
    openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        instructions:
          "Generate teacher-facing academic feedback. Follow the grading standards embedded before the student submission. Be specific, fair, concise, professionally neutral, encouraging, and rigorous.",
        input: prompt,
        max_output_tokens: 1800,
      }),
    });

    data = (await openAIResponse.json()) as OpenAIResponse;
  } catch {
    await logUsageEvent(supabase, parsed.request, false, "openai_unreachable");
    return Response.json(
      { error: "Unable to reach the feedback generation service." },
      { status: 502 },
    );
  }

  if (!openAIResponse.ok) {
    await logUsageEvent(supabase, parsed.request, false, "openai_error");
    return Response.json(
      { error: data.error?.message ?? "Feedback generation failed." },
      { status: openAIResponse.status },
    );
  }

  const feedback = extractFeedback(data);

  if (!feedback) {
    await logUsageEvent(supabase, parsed.request, false, "empty_feedback");
    return Response.json(
      { error: "Feedback generation returned no text." },
      { status: 502 },
    );
  }

  await logUsageEvent(supabase, parsed.request, true);

  return Response.json({ feedback });
}
