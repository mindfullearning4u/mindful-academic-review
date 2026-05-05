export type FeedbackMode = "basic" | "advanced";
export type CitationStyle = "APA" | "MLA" | "None";

export type FeedbackRequest = {
  mode: FeedbackMode;
  studentName: string;
  courseLevel: string;
  assignmentPrompt: string;
  assignmentRequirements: string;
  studentSubmission: string;
  rubric: string;
  citationStyle: CitationStyle;
};

function formatAssignmentContext(request: FeedbackRequest) {
  return `
Student Name:
${request.studentName}

Course / Grade Level:
${request.courseLevel}

Assignment Prompt:
${request.assignmentPrompt}

Assignment Requirements / Instructions:
${request.assignmentRequirements}

Student Submission:
${request.studentSubmission}`.trim();
}

export function buildBasicPrompt(request: FeedbackRequest) {
  return `
You are an experienced academic reviewer helping a teacher or instructor provide structured, professional feedback.

Review the student submission against the assignment prompt and requirements. Write feedback that is clear, specific, constructive, and appropriate for the course or grade level.

Include:
- Overall strengths
- Areas for improvement
- Assignment alignment
- Writing clarity and organization
- Actionable next steps for revision

Use a neutral academic tone. Do not invent facts, grades, scores, citations, or rubric criteria.

${formatAssignmentContext(request)}`.trim();
}

export function buildAdvancedPrompt(request: FeedbackRequest) {
  const rubricInstruction = request.rubric.trim()
    ? `Rubric:
${request.rubric}

Use the rubric to provide a rubric-aligned evaluation. Reference rubric criteria where relevant, but do not invent point values or final grades unless the rubric explicitly provides them.`
    : "No rubric was provided. Do not invent rubric criteria or scores.";

  const citationInstruction =
    request.citationStyle === "None"
      ? "Citation Style: None. Do not require APA or MLA formatting, but note whether source use is clear and appropriate when sources appear."
      : `Citation Style: ${request.citationStyle}. Check in-text citations and reference/works cited formatting for likely ${request.citationStyle} issues.`;

  return `
You are an experienced academic reviewer helping a teacher or instructor provide structured, professional feedback.

Review the student submission against the assignment prompt, requirements, and advanced review criteria below. Write feedback that is specific, constructive, neutral, and appropriate for the course or grade level.

Advanced review criteria:
- Assignment alignment: explain how well the submission addresses the prompt and stated requirements.
- Writing structure analysis: evaluate thesis/focus, organization, paragraph development, transitions, and conclusion.
- Remediation/review areas: identify the highest-priority topics or skills the student should revisit.
- Grammar and writing evaluation: note patterns in grammar, mechanics, clarity, tone, and word choice without over-editing the entire paper.
- Rubric-aligned evaluation when a rubric is provided.
- APA/MLA citation and reference check when a citation style is selected.
- Source quality recommendations: comment on whether sources appear credible, relevant, current, and academically appropriate when source use is visible.
- Academic integrity risk note: neutrally flag any visible concerns such as missing citations, unsupported claims, patchwriting, inconsistent voice, or overreliance on outside material. Do not accuse the student.
- Neutral academic tone guidance: keep feedback professional, direct, and supportive.
- First-person warning when inappropriate: if the assignment appears to require formal academic writing and the submission uses first person inappropriately, identify this as a revision issue.

${rubricInstruction}

${citationInstruction}

Do not invent facts, grades, scores, citations, or source details that are not present in the submitted text.

${formatAssignmentContext(request)}`.trim();
}
