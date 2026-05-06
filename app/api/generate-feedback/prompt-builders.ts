export type FeedbackMode = "basic" | "advanced";
export type CitationStyle = "APA" | "MLA" | "None";
export type FeedbackFocus =
  | "Answered Prompt"
  | "APA / MLA"
  | "Organization"
  | "Grammar & Writing"
  | "Critical Thinking"
  | "Scholarly Sources"
  | "Content Accuracy"
  | "Concise Instructor Notes"
  | "Rubric Alignment";
export type AssignmentType =
  | "Essay"
  | "Discussion Post"
  | "Case Assignment"
  | "Research Paper"
  | "Reflection Paper"
  | "Peer Response"
  | "Final Project"
  | "Final Paper"
  | "Graduate-Level / Thesis / Dissertation"
  | "Quiz Response"
  | "Short Answer";

export type FeedbackRequest = {
  mode: FeedbackMode;
  studentName: string;
  courseLevel: string;
  assignmentType: AssignmentType;
  assignmentPrompt: string;
  assignmentRequirements: string;
  studentSubmission: string;
  rubric: string;
  citationStyle: CitationStyle;
  feedbackFocus: FeedbackFocus[];
};

function formatAssignmentContext(request: FeedbackRequest) {
  return `
Student Name:
${request.studentName}

Course / Grade Level:
${request.courseLevel}

Assignment Type:
${request.assignmentType}

Assignment Prompt:
${request.assignmentPrompt}

Assignment Requirements / Instructions:
${request.assignmentRequirements}

Student Submission:
${request.studentSubmission}`.trim();
}

type AssignmentBehavior = {
  evaluate: string[];
  avoid?: string[];
  targetLength: string;
  notes?: string;
};

const ASSIGNMENT_BEHAVIOR_MATRIX: Record<AssignmentType, AssignmentBehavior> = {
  "Discussion Post": {
    evaluate: [
      "answered the discussion prompt",
      "understanding of the topic",
      "citations/references if required",
      "sufficient depth for discussion",
    ],
    avoid: [
      "thesis/body/conclusion structure",
      "full essay organization",
    ],
    targetLength: "50-90 words",
    notes: "Keep the tone concise and conversational.",
  },
  "Peer Response": {
    evaluate: [
      "meaningful contribution",
      "engagement with classmate",
      "thoughtful response",
      "professionalism",
    ],
    avoid: ["APA unless specifically required", "formal organization"],
    targetLength: "30-60 words",
  },
  "Reflection Paper": {
    evaluate: [
      "insight",
      "connection to topic",
      "authenticity",
      "clarity",
      "personal engagement",
    ],
    targetLength: "50-100 words",
    notes: "Allow first-person voice when appropriate for the assignment.",
  },
  Essay: {
    evaluate: [
      "organization",
      "clarity",
      "thesis/main idea",
      "supporting detail",
      "flow",
      "assignment completion",
    ],
    targetLength: "75-125 words",
  },
  "Research Paper": {
    evaluate: [
      "organization",
      "thesis/argument",
      "evidence/support",
      "APA/MLA if required",
      "scholarly sources",
      "critical thinking",
    ],
    avoid: ["excessive line-by-line critique"],
    targetLength: "75-150 words",
  },
  "Case Assignment": {
    evaluate: [
      "application of concepts",
      "analysis",
      "problem-solving",
      "real-world connection",
      "critical thinking",
    ],
    targetLength: "75-125 words",
  },
  "Final Project": {
    evaluate: [
      "overall quality",
      "completion of requirements",
      "strengths",
      "missing elements",
      "overall academic performance",
    ],
    avoid: [
      "extensive revision coaching because the course or project is ending",
    ],
    targetLength: "75-125 words",
  },
  "Final Paper": {
    evaluate: [
      "overall quality",
      "completion of requirements",
      "strengths",
      "missing elements",
      "overall academic performance",
    ],
    avoid: [
      "extensive revision coaching because the course or project is ending",
    ],
    targetLength: "75-125 words",
  },
  "Graduate-Level / Thesis / Dissertation": {
    evaluate: [
      "scholarly rigor",
      "depth of analysis",
      "organization",
      "research quality",
      "academic tone",
      "literature integration",
      "methodology/argument quality",
    ],
    targetLength: "100-200 words only when necessary",
    notes: "Stay concise even when evaluating advanced scholarly work.",
  },
  "Quiz Response": {
    evaluate: [
      "accuracy",
      "direct response to the question",
      "relevant course concepts",
      "one clear study or review step",
    ],
    avoid: ["essay-style structure", "extended revision coaching"],
    targetLength: "30-60 words",
  },
  "Short Answer": {
    evaluate: [
      "directly answers the question",
      "relevant support",
      "clear understanding",
    ],
    avoid: ["full essay development", "extended structure critique"],
    targetLength: "30-60 words",
  },
};

function formatAssignmentBehaviorMatrix(request: FeedbackRequest) {
  if (request.rubric.trim()) {
    return `
Assignment Behavior Matrix:
- A rubric was provided, so rubric categories override assignment-type behavior.
- Base feedback primarily on the rubric only.
- Give 1-2 concise sentences per rubric category.
- Do not add broad assignment-type analysis unless it directly supports a rubric category.`.trim();
  }

  const behavior = ASSIGNMENT_BEHAVIOR_MATRIX[request.assignmentType];
  const avoid = behavior.avoid?.length
    ? `
Do not evaluate:
- ${behavior.avoid.join("\n- ")}`
    : "";
  const notes = behavior.notes ? `\n${behavior.notes}` : "";

  return `
Assignment Behavior Matrix:
Assignment Type: ${request.assignmentType}
Use these assignment-specific rules because no rubric was provided.

Evaluate:
- ${behavior.evaluate.join("\n- ")}${avoid}

Target length: ${behavior.targetLength}.
${notes}
Focus only on the most relevant areas for this assignment type. Do not overanalyze or overwhelm the student.`.trim();
}

function formatFeedbackFocusGuidance(request: FeedbackRequest) {
  if (request.rubric.trim()) {
    return `
Feedback Focus:
- Rubric provided: ignore selected focus categories.
- Rubric categories override Feedback Focus.
- Do not add unrelated feedback outside the rubric.`.trim();
  }

  if (request.feedbackFocus.length === 0) {
    return `
Feedback Focus:
- No focus categories were selected.
- Use the Assignment Behavior Matrix defaults only.`.trim();
  }

  return `
Feedback Focus:
Selected categories:
- ${request.feedbackFocus.join("\n- ")}

Use only the selected Feedback Focus categories. Do not evaluate areas the instructor did not select. Keep the response concise and avoid unnecessary analysis to reduce token usage.`.trim();
}

function formatGradingStandards(gradingStandards: string) {
  return `
Grading Standards and Feedback Philosophy:
${gradingStandards}`.trim();
}

function formatOutputGuidance() {
  return `
Output Formatting:
- Avoid rigid AI-style section formatting and report-style structure.
- Avoid large formal headings followed by long paragraphs.
- Use subtle instructional labels naturally when helpful, such as "APA -", "Organization -", "Content -", "Analysis -", or "Grammar -".
- Make the feedback flow like realistic LMS grading comments or professor assignment notes, not a generated analysis report.
- Use short, natural commentary blocks.
- Keep comments concise and conversational-professional.
- Use short paragraphs that are easy to paste into LMS grading comments.
- Use bullet points only where helpful.
- Leave one blank line between major sections.
- Preserve paragraph breaks; do not return the feedback as one run-on paragraph.
- Do not use markdown headings.
- Do not use large section titles.
- Do not use ALL CAPS.
- Do not use excessive bold formatting.
- Do not use bold-heavy formatting.
- Do not use excessive bullets or AI-style formatting.
- Avoid formatting that feels aggressive, angry, emotionally harsh, cluttered, or overly stylized.
- Use normal sentence casing and natural paragraph flow.
- Avoid excessive structure, textbook-style evaluation sections, and AI-generated sounding organization.
- Keep the visual presentation clean, calm, approachable, academically professional, and emotionally neutral/supportive.`.trim();
}

function formatLengthGuidance(mode: FeedbackMode, request: FeedbackRequest) {
  const wordLimit =
    mode === "basic"
      ? "Basic Mode: 100-175 words maximum."
      : "Advanced Mode: 175-300 words maximum unless a rubric requires more detail.";
  const rubricOverride = request.rubric.trim()
    ? "Rubric override: keep each rubric category to 1-2 concise sentences."
    : `Assignment behavior target: follow the ${request.assignmentType} target length from the Assignment Behavior Matrix.`;

  return `
Length and Prioritization:
- Keep feedback concise and efficient, like an instructor grading under practical time constraints.
- Do not write essay-length grading responses.
- Prioritize the most important strengths and weaknesses only.
- Focus on the top 2-3 priorities for improvement.
- Keep feedback concise enough that students will actually read it.
- Do not overload students with too many correction points.
- Avoid repeating the same issue in multiple sections.
- Keep most sections to one short paragraph or 2-4 concise bullet points.
- Use short paragraphs and clear bullets.
- Avoid long academic explanations unless the assignment requires detailed instructor feedback.
- Make feedback practical, readable, and motivating.
- The goal is not to explain everything; the goal is to guide the student toward the next best revision step.
- ${wordLimit}
- ${rubricOverride}
- Do not exceed this limit unless absolutely necessary.`.trim();
}

function formatInstructorVoiceGuidance() {
  return `
Instructor Voice:
- Write directly to the student in a natural teacher or professor voice.
- Begin by recognizing what the student did well before naming needed improvements.
- Acknowledge effort and progress when appropriate, but do not overpraise weak work.
- Use direct language such as "You did well with...", "You addressed...", "You need to strengthen...", "Your next step is...", "Make sure you...", and "This would be stronger if...".
- Use supportive guidance such as "Continue building on...", "You are moving in the right direction...", "Strengthening this area would improve your paper further...", and "Reach out if you need additional clarification or support."
- Keep the tone encouraging, motivating, constructive, caring, professional, academically focused, human, specific, and concise.
- Maintain academic standards and be assertive and clear about needed improvements.
- Guide revision and growth without sounding discouraging.
- Maintain honesty and academic integrity.
- Avoid harsh wording, overly critical tone, robotic criticism, and negative or punitive language.
- Avoid robotic, overly formal, overly polished, or generic phrasing.
- Do not use AI-sounding phrases such as "overall, this response demonstrates", "it is important to note", "this submission effectively", "the student should consider", or "in conclusion".
- Avoid generic transitions and filler. Give concrete feedback tied to the assignment and submission.`.trim();
}

function formatPersonalizationGuidance() {
  return `
Personalization:
- Make the feedback feel specific to this student's actual submission.
- Reference actual strengths, weaknesses, ideas, examples, claims, structure, or writing patterns from the student response when possible.
- Avoid generic comments that could apply to any paper.
- Vary sentence structure and phrasing naturally so the response does not feel templated.
- Do not overuse the student's name, but write as if you personally reviewed this specific paper.
- Help the student feel seen, individually evaluated, and personally guided.
- Sound like a real instructor who reviewed the work, not a grading bot or automated template system.`.trim();
}

export function buildBasicPrompt(
  request: FeedbackRequest,
  gradingStandards: string,
) {
  return `
You are an experienced academic reviewer helping a teacher or instructor provide structured, professional feedback.

Follow these grading standards as system-level guidance before reviewing the student submission:

${formatGradingStandards(gradingStandards)}

${formatAssignmentBehaviorMatrix(request)}

${formatFeedbackFocusGuidance(request)}

Review the student submission against the assignment prompt and requirements. Write feedback that is clear, specific, constructive, and appropriate for the course or grade level.

Include:
- Overall strengths
- Areas for improvement
- Assignment alignment
- Writing clarity and organization
- Actionable next steps for revision

${formatInstructorVoiceGuidance()}

${formatPersonalizationGuidance()}

${formatLengthGuidance("basic", request)}

${formatOutputGuidance()}

Use a neutral academic tone. Do not invent facts, grades, scores, citations, or rubric criteria.

${formatAssignmentContext(request)}`.trim();
}

export function buildAdvancedPrompt(
  request: FeedbackRequest,
  gradingStandards: string,
) {
  const hasRubric = Boolean(request.rubric.trim());
  const rubricInstruction = request.rubric.trim()
    ? `Rubric:
${request.rubric}

Use the rubric to provide a rubric-aligned evaluation. Reference rubric criteria where relevant, but do not invent point values or final grades unless the rubric explicitly provides them. Keep each rubric category to 1-2 concise sentences.`
    : "No rubric was provided. Do not invent rubric criteria or scores.";

  const citationInstruction =
    request.citationStyle === "None"
      ? "Citation Style: None. Do not require APA or MLA formatting, but note whether source use is clear and appropriate when sources appear."
      : `Citation Style: ${request.citationStyle}. Check in-text citations and reference/works cited formatting for likely ${request.citationStyle} issues.`;

  return `
You are an experienced academic reviewer helping a teacher or instructor provide structured, professional feedback.

Follow these grading standards as system-level guidance before reviewing the student submission:

${formatGradingStandards(gradingStandards)}

${formatAssignmentBehaviorMatrix(request)}

${formatFeedbackFocusGuidance(request)}

Review the student submission against the assignment prompt and requirements. Write feedback that is specific, constructive, neutral, and appropriate for the course or grade level.

${
  hasRubric
    ? "Because a rubric is provided, do not add a separate advanced analysis section. Let the rubric categories drive the feedback."
    : `Advanced review should stay limited to the Assignment Behavior Matrix for ${request.assignmentType}. Only mention citation, source quality, academic integrity, grammar, or structure when they are relevant to that assignment type and visible in the submission.`
}

${formatInstructorVoiceGuidance()}

${formatPersonalizationGuidance()}

${formatLengthGuidance("advanced", request)}

${formatOutputGuidance()}

${rubricInstruction}

${citationInstruction}

Do not invent facts, grades, scores, citations, or source details that are not present in the submitted text.

${formatAssignmentContext(request)}`.trim();
}
