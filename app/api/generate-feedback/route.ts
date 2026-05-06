import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  buildAdvancedPrompt,
  buildBasicPrompt,
  type AssignmentType,
  type CitationStyle,
  type FeedbackMode,
  type FeedbackRequest,
} from "./prompt-builders";

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

function isFeedbackMode(value: unknown): value is FeedbackMode {
  return value === "basic" || value === "advanced";
}

function isCitationStyle(value: unknown): value is CitationStyle {
  return value === "APA" || value === "MLA" || value === "None";
}

function isAssignmentType(value: unknown): value is AssignmentType {
  return (
    value === "Discussion Post" ||
    value === "Peer Response" ||
    value === "Reflection" ||
    value === "Essay" ||
    value === "Research Paper" ||
    value === "Case Study" ||
    value === "Final Paper/Project" ||
    value === "Short Response"
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseFeedbackRequest(body: Record<string, unknown>) {
  if (!isFeedbackMode(body.mode)) {
    return { error: "A valid mode is required." };
  }

  if (!isCitationStyle(body.citationStyle)) {
    return { error: "A valid citation style is required." };
  }

  if (!isAssignmentType(body.assignmentType)) {
    return { error: "A valid assignment type is required." };
  }

  if (!isNonEmptyString(body.studentName)) {
    return { error: "studentName is required." };
  }

  if (!isNonEmptyString(body.courseLevel)) {
    return { error: "courseLevel is required." };
  }

  if (!isNonEmptyString(body.assignmentPrompt)) {
    return { error: "assignmentPrompt is required." };
  }

  if (!isNonEmptyString(body.assignmentRequirements)) {
    return { error: "assignmentRequirements is required." };
  }

  if (!isNonEmptyString(body.studentSubmission)) {
    return { error: "studentSubmission is required." };
  }

  const request: FeedbackRequest = {
    mode: body.mode,
    studentName: body.studentName.trim(),
    courseLevel: body.courseLevel.trim(),
    assignmentType: body.assignmentType,
    assignmentPrompt: body.assignmentPrompt.trim(),
    assignmentRequirements: body.assignmentRequirements.trim(),
    studentSubmission: body.studentSubmission.trim(),
    rubric: typeof body.rubric === "string" ? body.rubric.trim() : "",
    citationStyle: body.citationStyle,
  };

  return { request };
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

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseFeedbackRequest(body);

  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  let gradingStandards: string;

  try {
    gradingStandards = await getGradingStandards();
  } catch {
    return Response.json(
      { error: "Unable to load grading standards." },
      { status: 500 },
    );
  }

  const prompt =
    parsed.request.mode === "advanced"
      ? buildAdvancedPrompt(parsed.request, gradingStandards)
      : buildBasicPrompt(parsed.request, gradingStandards);

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
    return Response.json(
      { error: "Unable to reach the feedback generation service." },
      { status: 502 },
    );
  }

  if (!openAIResponse.ok) {
    return Response.json(
      { error: data.error?.message ?? "Feedback generation failed." },
      { status: openAIResponse.status },
    );
  }

  const feedback = extractFeedback(data);

  if (!feedback) {
    return Response.json(
      { error: "Feedback generation returned no text." },
      { status: 502 },
    );
  }

  return Response.json({ feedback });
}
