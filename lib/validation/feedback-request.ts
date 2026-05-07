import { z } from "zod";

const MAX_TOTAL_REQUEST_CHARS = 60000;

export const feedbackRequestSchema = z.object({
  serviceTier: z
    .enum(["Basic", "Premium", "Graduate / Research"])
    .default("Premium"),
  instructorName: z.string().trim().max(120).optional().default(""),
  studentName: z.string().trim().min(1).max(120),
  courseLevel: z.string().trim().min(1).max(200),
  assignmentType: z.enum([
    "Essay",
    "Discussion Post",
    "Case Assignment",
    "Research Paper",
    "Reflection Paper",
    "Peer Response",
    "Final Project",
    "Final Paper",
    "Graduate-Level / Thesis / Dissertation",
    "Quiz Response",
    "Short Answer",
  ]),
  assignmentPrompt: z.string().trim().min(1).max(12000),
  assignmentRequirements: z.string().trim().min(1).max(12000),
  studentSubmission: z.string().trim().min(1).max(30000),
  rubric: z.string().trim().max(12000).optional().default(""),
  citationStyle: z.enum(["APA", "MLA", "None"]),
  feedbackFocus: z
    .array(
      z.enum([
        "Answered Prompt",
        "APA / MLA",
        "Organization",
        "Grammar & Writing",
        "Critical Thinking",
        "Scholarly Sources",
        "Content Accuracy",
        "Concise Instructor Notes",
        "Rubric Alignment",
      ]),
    )
    .max(9)
    .optional()
    .default([]),
});

export type ValidatedFeedbackRequest = z.infer<typeof feedbackRequestSchema>;

export function validateFeedbackRequest(body: unknown) {
  const parsed = feedbackRequestSchema.safeParse(body);

  if (!parsed.success) {
    return {
      error: "Invalid feedback request.",
      details: parsed.error.flatten().fieldErrors,
    };
  }

  const request = parsed.data;
  const totalCharacters =
    request.instructorName.length +
    request.studentName.length +
    request.courseLevel.length +
    request.assignmentPrompt.length +
    request.assignmentRequirements.length +
    request.studentSubmission.length +
    request.rubric.length +
    request.feedbackFocus.join("").length;

  if (totalCharacters > MAX_TOTAL_REQUEST_CHARS) {
    return {
      error: "Request is too large. Please shorten the assignment materials or submission.",
    };
  }

  return { request };
}
