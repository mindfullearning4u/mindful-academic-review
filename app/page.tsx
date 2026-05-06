"use client";

import { useMemo, useState } from "react";

type Mode = "basic" | "advanced";
type CitationStyle = "APA" | "MLA" | "None";
type FeedbackFocus =
  | "Answered Prompt"
  | "APA / MLA"
  | "Organization"
  | "Grammar & Writing"
  | "Critical Thinking"
  | "Scholarly Sources"
  | "Content Accuracy"
  | "Concise Instructor Notes"
  | "Rubric Alignment";
type AssignmentType =
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

type AssignmentProfile = {
  name: string;
  courseLevel: string;
  assignmentPrompt: string;
  assignmentRequirements: string;
  rubric: string;
  citationStyle: CitationStyle;
  assignmentType: AssignmentType;
  mode: Mode;
};

type AssignmentTemplate = {
  name: string;
  prompt: string;
  requirements: string;
  rubric: string;
  citationStyle: CitationStyle;
  assignmentType: AssignmentType;
  mode: Mode;
};

type CourseAssignmentLibrary = {
  courseLevel: string;
  assignments: AssignmentTemplate[];
};

const STORAGE_KEY = "mindful-academic-review-profiles";
const PLACEHOLDER_OUTPUT = "Instructor feedback will appear here.";
const FEEDBACK_FOCUS_OPTIONS: FeedbackFocus[] = [
  "Answered Prompt",
  "APA / MLA",
  "Organization",
  "Grammar & Writing",
  "Critical Thinking",
  "Scholarly Sources",
  "Content Accuracy",
  "Concise Instructor Notes",
  "Rubric Alignment",
];
const ASSIGNMENT_TYPES: AssignmentType[] = [
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
];

function normalizeAssignmentType(value: unknown): AssignmentType {
  if (value === "Case Study") {
    return "Case Assignment";
  }

  if (value === "Reflection") {
    return "Reflection Paper";
  }

  if (value === "Final Paper/Project") {
    return "Final Project";
  }

  if (value === "Short Response") {
    return "Short Answer";
  }

  return ASSIGNMENT_TYPES.includes(value as AssignmentType)
    ? (value as AssignmentType)
    : "Essay";
}

function getSavedProfiles(): AssignmentProfile[] {
  if (typeof window === "undefined") {
    return [];
  }

  const savedProfiles = window.localStorage.getItem(STORAGE_KEY);

  if (!savedProfiles) {
    return [];
  }

  try {
    const parsed = JSON.parse(savedProfiles) as Partial<AssignmentProfile>[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((profile) => profile.name && profile.courseLevel)
      .map((profile) => ({
        name: profile.name ?? "",
        courseLevel: profile.courseLevel ?? "",
        assignmentPrompt: profile.assignmentPrompt ?? "",
        assignmentRequirements: profile.assignmentRequirements ?? "",
        rubric: profile.rubric ?? "",
        citationStyle: profile.citationStyle ?? "APA",
        assignmentType: normalizeAssignmentType(profile.assignmentType),
        mode: profile.mode ?? "basic",
      }));
  } catch {
    return [];
  }
}

function buildCourseAssignmentLibrary(
  profiles: AssignmentProfile[],
): CourseAssignmentLibrary[] {
  return profiles.reduce<CourseAssignmentLibrary[]>((library, profile) => {
    const assignment: AssignmentTemplate = {
      name: profile.name,
      prompt: profile.assignmentPrompt,
      requirements: profile.assignmentRequirements,
      rubric: profile.rubric,
      citationStyle: profile.citationStyle,
      assignmentType: profile.assignmentType,
      mode: profile.mode,
    };
    const existingCourse = library.find(
      (course) => course.courseLevel === profile.courseLevel,
    );

    if (existingCourse) {
      existingCourse.assignments.push(assignment);
      return library;
    }

    return [
      ...library,
      { courseLevel: profile.courseLevel, assignments: [assignment] },
    ];
  }, []);
}

function toAssignmentProfile(
  courseLevel: string,
  assignment: AssignmentTemplate,
): AssignmentProfile {
  return {
    name: assignment.name,
    courseLevel,
    assignmentPrompt: assignment.prompt,
    assignmentRequirements: assignment.requirements,
    rubric: assignment.rubric,
    citationStyle: assignment.citationStyle,
    assignmentType: assignment.assignmentType,
    mode: assignment.mode,
  };
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("basic");
  const [studentName, setStudentName] = useState("");
  const [courseLevel, setCourseLevel] = useState("");
  const [assignmentType, setAssignmentType] =
    useState<AssignmentType>("Essay");
  const [assignmentPrompt, setAssignmentPrompt] = useState("");
  const [assignmentRequirements, setAssignmentRequirements] = useState("");
  const [studentSubmission, setStudentSubmission] = useState("");
  const [rubric, setRubric] = useState("");
  const [citationStyle, setCitationStyle] = useState<CitationStyle>("APA");
  const [feedbackFocus, setFeedbackFocus] = useState<FeedbackFocus[]>([]);
  const [profileName, setProfileName] = useState("");
  const [profiles, setProfiles] =
    useState<AssignmentProfile[]>(getSavedProfiles);
  const [output, setOutput] = useState(PLACEHOLDER_OUTPUT);
  const [isGenerating, setIsGenerating] = useState(false);

  const courseAssignmentLibrary = useMemo(
    () => buildCourseAssignmentLibrary(profiles),
    [profiles],
  );

  function persistProfiles(nextProfiles: AssignmentProfile[]) {
    setProfiles(nextProfiles);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfiles));
  }

  function saveCurrentProfile() {
    const trimmedName = profileName.trim();
    const trimmedCourseLevel = courseLevel.trim();

    if (!trimmedName || !trimmedCourseLevel) {
      setOutput(
        "Please enter Course / Grade Level and Assignment/Profile Name before saving.",
      );
      return;
    }

    const nextProfile: AssignmentProfile = {
      name: trimmedName,
      courseLevel: trimmedCourseLevel,
      assignmentPrompt,
      assignmentRequirements,
      rubric,
      citationStyle,
      assignmentType,
      mode,
    };

    const remainingProfiles = profiles.filter(
      (profile) =>
        !(
          profile.name === trimmedName &&
          profile.courseLevel === trimmedCourseLevel
        ),
    );
    const nextProfiles = [...remainingProfiles, nextProfile].sort((a, b) => {
      const courseComparison = a.courseLevel.localeCompare(b.courseLevel);

      return courseComparison || a.name.localeCompare(b.name);
    });

    persistProfiles(nextProfiles);
  }

  function loadProfile(profile: AssignmentProfile) {
    setCourseLevel(profile.courseLevel);
    setAssignmentPrompt(profile.assignmentPrompt);
    setAssignmentRequirements(profile.assignmentRequirements);
    setRubric(profile.rubric);
    setCitationStyle(profile.citationStyle);
    setAssignmentType(profile.assignmentType);
    setMode(profile.mode);
  }

  function clearStudentOnly() {
    setStudentName("");
    setStudentSubmission("");
    setOutput(PLACEHOLDER_OUTPUT);
  }

  function clearOutputOnly() {
    setOutput(PLACEHOLDER_OUTPUT);
  }

  function clearAll() {
    setStudentName("");
    setCourseLevel("");
    setAssignmentType("Essay");
    setAssignmentPrompt("");
    setAssignmentRequirements("");
    setStudentSubmission("");
    setRubric("");
    setCitationStyle("APA");
    setFeedbackFocus([]);
    setOutput(PLACEHOLDER_OUTPUT);
  }

  function toggleFeedbackFocus(focus: FeedbackFocus) {
    setFeedbackFocus((selectedFocus) =>
      selectedFocus.includes(focus)
        ? selectedFocus.filter((item) => item !== focus)
        : [...selectedFocus, focus],
    );
  }

  async function generateFeedback() {
    const requiredFields = [
      { label: "Student Name", value: studentName },
      { label: "Course / Grade Level", value: courseLevel },
      { label: "Assignment Prompt", value: assignmentPrompt },
      {
        label: "Assignment Requirements / Instructions",
        value: assignmentRequirements,
      },
      { label: "Student Submission", value: studentSubmission },
    ];
    const missingFields = requiredFields
      .filter((field) => !field.value.trim())
      .map((field) => field.label);

    if (missingFields.length > 0) {
      setOutput(`Please complete: ${missingFields.join(", ")}.`);
      return;
    }

    setIsGenerating(true);
    setOutput("Reviewing submission...");

    try {
      const response = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          studentName,
          courseLevel,
          assignmentType,
          assignmentPrompt,
          assignmentRequirements,
          studentSubmission,
          rubric,
          citationStyle,
          feedbackFocus,
        }),
      });
      const data = (await response.json()) as {
        feedback?: string;
        error?: string;
      };

      if (!response.ok) {
        setOutput(data.error ?? "Feedback generation failed.");
        return;
      }

      setOutput(data.feedback ?? PLACEHOLDER_OUTPUT);
    } catch {
      setOutput("Feedback generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
  }

  function downloadOutput() {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "mindful-academic-review-feedback.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f2eee6] px-5 py-8 text-[#232b28] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1680px]">
        <header className="rounded-2xl border border-[#d7cdbc]/80 bg-[#e9e1d4] px-6 py-7 shadow-[0_8px_24px_rgba(43,38,30,0.06)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#c6bba9] bg-[#203b37] text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#fff8ea] shadow-[0_5px_14px_rgba(32,38,35,0.14)]">
              MAR
            </div>
            <div className="pt-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#685d48]">
                Academic Review Workspace
              </p>
            </div>
          </div>
          <h1 className="mt-7 text-3xl font-semibold tracking-tight text-[#17211f] sm:text-4xl">
            Mindful Academic Review
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#56625e] sm:text-lg">
            Structured academic feedback for teachers and instructors.
          </p>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)_590px]">
          <aside className="rounded-2xl border border-[#ddd4c6]/80 bg-[#fffaf2] p-6 shadow-[0_10px_28px_rgba(43,38,30,0.08)] lg:sticky lg:top-8 lg:self-start">
            <h2 className="text-base font-semibold text-[#1d2524]">
              Saved Courses & Assignments
            </h2>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-[#394541]">
                Assignment/Profile Name
                <input
                  className="rounded-xl border border-[#d8cebd] bg-[#fffdf7] px-3.5 py-2.5 text-base text-[#232b28] outline-none transition duration-200 placeholder:text-[#8b8478] focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                  onChange={(event) => setProfileName(event.target.value)}
                  value={profileName}
                />
              </label>

              <button
                className="rounded-xl bg-[#23413d] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_5px_12px_rgba(32,38,35,0.14)] transition duration-200 hover:bg-[#2d4a43]"
                onClick={saveCurrentProfile}
                type="button"
              >
                Save Assignment Template
              </button>
              <p className="text-xs leading-5 text-[#75684f]">
                Saves prompt, requirements, rubric, and course setup.
              </p>
            </div>

            <div className="mt-6 space-y-5 border-t border-[#e4dacb]/80 pt-5">
              {courseAssignmentLibrary.length > 0 ? (
                courseAssignmentLibrary.map((course) => (
                  <div key={course.courseLevel}>
                    <h3 className="text-sm font-semibold text-[#27322f]">
                      {course.courseLevel}
                    </h3>
                    <div className="mt-2 grid gap-1.5">
                      {course.assignments.map((assignment) => (
                        <button
                          className="rounded-xl px-3 py-2 text-left text-sm leading-5 text-[#5b6661] transition duration-200 hover:bg-[#f3ecdf] hover:text-[#1d2524]"
                          key={`${course.courseLevel}-${assignment.name}`}
                          onClick={() =>
                            loadProfile(
                              toAssignmentProfile(
                                course.courseLevel,
                                assignment,
                              ),
                            )
                          }
                          type="button"
                        >
                          {assignment.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-[#56615d]">
                  Saved assignments will appear here.
                </p>
              )}
            </div>
          </aside>

          <div className="space-y-6">
            <section className="rounded-2xl border border-[#ddd4c6]/80 bg-[#fffaf2] p-6 shadow-[0_10px_28px_rgba(43,38,30,0.08)]">
              <h2 className="text-base font-semibold text-[#1d2524]">
                Review Mode
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(["basic", "advanced"] as Mode[]).map((modeOption) => (
                  <button
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition duration-200 ${
                      mode === modeOption
                        ? "border-[#23413d] bg-[#23413d] text-white shadow-[0_5px_12px_rgba(32,38,35,0.14)]"
                        : "border-[#ddd4c6] bg-[#fffdf7] text-[#394541] hover:border-[#b6a68f] hover:bg-[#f3ecdf]"
                    }`}
                    key={modeOption}
                    onClick={() => setMode(modeOption)}
                    type="button"
                  >
                    {modeOption === "basic" ? "Basic Mode" : "Advanced Mode"}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#ddd4c6]/80 bg-[#fffaf2] p-6 shadow-[0_10px_28px_rgba(43,38,30,0.08)]">
              <h2 className="text-base font-semibold text-[#1d2524]">
                Assignment Details
              </h2>

              <div className="mt-6 grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-[#394541]">
                    Student Name
                    <input
                      className="rounded-xl border border-[#d8cebd] bg-[#fffdf7] px-3.5 py-2.5 text-base text-[#232b28] outline-none transition duration-200 placeholder:text-[#8b8478] focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                      onChange={(event) => setStudentName(event.target.value)}
                      value={studentName}
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-[#394541]">
                    Course / Grade Level
                    <input
                      className="rounded-xl border border-[#d8cebd] bg-[#fffdf7] px-3.5 py-2.5 text-base text-[#232b28] outline-none transition duration-200 placeholder:text-[#8b8478] focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                      onChange={(event) => setCourseLevel(event.target.value)}
                      value={courseLevel}
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-[#394541]">
                    Assignment Type
                    <select
                      className="rounded-xl border border-[#d8cebd] bg-[#fffdf7] px-3.5 py-2.5 text-base text-[#232b28] outline-none transition duration-200 focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                      onChange={(event) =>
                        setAssignmentType(event.target.value as AssignmentType)
                      }
                      value={assignmentType}
                    >
                      {ASSIGNMENT_TYPES.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="grid gap-2 text-sm font-medium text-[#394541]">
                  Assignment Prompt
                  <textarea
                    className="min-h-28 rounded-xl border border-[#d8cebd] bg-[#fffdf7] px-3.5 py-2.5 text-base text-[#232b28] outline-none transition duration-200 placeholder:text-[#8b8478] focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                    onChange={(event) =>
                      setAssignmentPrompt(event.target.value)
                    }
                    value={assignmentPrompt}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-[#394541]">
                  Assignment Requirements / Instructions
                  <textarea
                    className="min-h-32 rounded-xl border border-[#d8cebd] bg-[#fffdf7] px-3.5 py-2.5 text-base text-[#232b28] outline-none transition duration-200 placeholder:text-[#8b8478] focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                    onChange={(event) =>
                      setAssignmentRequirements(event.target.value)
                    }
                    value={assignmentRequirements}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-[#394541]">
                  Student Submission
                  <textarea
                    className="min-h-80 rounded-xl border border-[#d8cebd] bg-[#fffdf7] px-3.5 py-2.5 text-base text-[#232b28] outline-none transition duration-200 placeholder:text-[#8b8478] focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                    onChange={(event) =>
                      setStudentSubmission(event.target.value)
                    }
                    value={studentSubmission}
                  />
                </label>

                {mode === "advanced" ? (
                  <div className="grid gap-5 rounded-2xl border border-[#e4dacb]/80 bg-[#fbf6ed] p-5">
                    <label className="grid gap-2 text-sm font-medium text-[#394541]">
                      Rubric
                      <textarea
                        className="min-h-36 rounded-xl border border-[#d8cebd] bg-[#fffdf7] px-3.5 py-2.5 text-base text-[#232b28] outline-none transition duration-200 placeholder:text-[#8b8478] focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                        onChange={(event) => setRubric(event.target.value)}
                        value={rubric}
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-[#394541] sm:max-w-xs">
                      Citation Style
                      <select
                        className="rounded-xl border border-[#d8cebd] bg-[#fffdf7] px-3.5 py-2.5 text-base text-[#232b28] outline-none transition duration-200 focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                        onChange={(event) =>
                          setCitationStyle(event.target.value as CitationStyle)
                        }
                        value={citationStyle}
                      >
                        <option>APA</option>
                        <option>MLA</option>
                        <option>None</option>
                      </select>
                    </label>
                  </div>
                ) : null}

                <section className="grid gap-3 rounded-2xl border border-[#e4dacb]/80 bg-[#fbf6ed] p-5">
                  <div>
                    <h3 className="text-sm font-semibold text-[#27322f]">
                      Feedback Focus
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#75684f]">
                      Select focus areas when no rubric is provided.
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {FEEDBACK_FOCUS_OPTIONS.map((focus) => (
                      <label
                        className="flex items-center gap-2 rounded-xl border border-[#d8cebd] bg-[#fffdf7] px-3 py-2 text-sm font-medium text-[#394541]"
                        key={focus}
                      >
                        <input
                          checked={feedbackFocus.includes(focus)}
                          className="h-4 w-4 accent-[#23413d]"
                          onChange={() => toggleFeedbackFocus(focus)}
                          type="checkbox"
                        />
                        {focus}
                      </label>
                    ))}
                  </div>
                </section>
              </div>
            </section>

            <button
              className="w-full rounded-xl bg-[#17211f] px-5 py-3.5 text-base font-semibold text-white shadow-[0_8px_18px_rgba(32,38,35,0.16)] transition duration-200 hover:bg-[#2d4a43] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isGenerating}
              onClick={generateFeedback}
              type="button"
            >
              {isGenerating ? "Reviewing submission..." : "Generate Feedback"}
            </button>

            <section className="rounded-2xl border border-[#ddd4c6]/80 bg-[#fffaf2] p-6 shadow-[0_10px_28px_rgba(43,38,30,0.08)]">
              <h2 className="text-base font-semibold text-[#1d2524]">Reset</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-xl border border-[#cfc5b5] bg-[#fffdf7] px-4 py-2.5 text-sm font-semibold text-[#394541] transition duration-200 hover:border-[#a99578] hover:bg-[#f3ecdf]"
                  onClick={clearStudentOnly}
                  type="button"
                >
                  Clear Student Only
                </button>
                <button
                  className="rounded-xl border border-[#cfc5b5] bg-[#fffdf7] px-4 py-2.5 text-sm font-semibold text-[#394541] transition duration-200 hover:border-[#a99578] hover:bg-[#f3ecdf]"
                  onClick={clearOutputOnly}
                  type="button"
                >
                  Clear Output Only
                </button>
                <button
                  className="rounded-xl border border-[#d2bbb1] bg-[#fffdf7] px-4 py-2.5 text-sm font-semibold text-[#7a3327] transition duration-200 hover:border-[#9a4b3f] hover:bg-[#fbf0eb]"
                  onClick={clearAll}
                  type="button"
                >
                  Clear All
                </button>
              </div>
            </section>
          </div>

          <aside className="rounded-2xl border border-[#ddd4c6]/80 bg-[#fffaf2] p-6 shadow-[0_10px_28px_rgba(43,38,30,0.08)] lg:sticky lg:top-8 lg:self-start">
            <h2 className="text-base font-semibold text-[#1d2524]">Output</h2>
            <div
              aria-busy={isGenerating}
              className={`mt-4 min-h-[30rem] whitespace-pre-wrap rounded-2xl border border-[#e7ddce]/70 bg-[#fff8ee] px-7 py-6 text-[0.95rem] leading-8 text-[#3f4b47] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ${
                isGenerating ? "animate-pulse" : ""
              }`}
            >
              {output}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <button
                className="rounded-xl border border-[#cfc5b5] bg-[#fffdf7] px-4 py-2.5 text-sm font-semibold text-[#394541] transition duration-200 hover:border-[#a99578] hover:bg-[#f3ecdf]"
                onClick={copyOutput}
                type="button"
              >
                Copy Output
              </button>
              <button
                className="rounded-xl border border-[#cfc5b5] bg-[#fffdf7] px-4 py-2.5 text-sm font-semibold text-[#394541] transition duration-200 hover:border-[#a99578] hover:bg-[#f3ecdf]"
                onClick={downloadOutput}
                type="button"
              >
                Download Text
              </button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
