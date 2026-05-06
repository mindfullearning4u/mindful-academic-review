"use client";

import { useMemo, useState } from "react";

type Mode = "basic" | "advanced";
type CitationStyle = "APA" | "MLA" | "None";
type AssignmentType =
  | "Discussion Post"
  | "Peer Response"
  | "Reflection"
  | "Essay"
  | "Research Paper"
  | "Case Study"
  | "Final Paper/Project"
  | "Short Response";

type AssignmentProfile = {
  name: string;
  courseLevel: string;
  assignmentPrompt: string;
  assignmentRequirements: string;
  rubric: string;
  citationStyle: CitationStyle;
  mode: Mode;
};

const STORAGE_KEY = "mindful-academic-review-profiles";
const PLACEHOLDER_OUTPUT = "Generated feedback will appear here.";
const ASSIGNMENT_TYPES: AssignmentType[] = [
  "Discussion Post",
  "Peer Response",
  "Reflection",
  "Essay",
  "Research Paper",
  "Case Study",
  "Final Paper/Project",
  "Short Response",
];

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
        mode: profile.mode ?? "basic",
      }));
  } catch {
    return [];
  }
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
  const [profileName, setProfileName] = useState("");
  const [profiles, setProfiles] =
    useState<AssignmentProfile[]>(getSavedProfiles);
  const [output, setOutput] = useState(PLACEHOLDER_OUTPUT);
  const [isGenerating, setIsGenerating] = useState(false);

  const groupedProfiles = useMemo(
    () =>
      profiles.reduce<{ courseLevel: string; profiles: AssignmentProfile[] }[]>(
        (groups, profile) => {
          const existingGroup = groups.find(
            (group) => group.courseLevel === profile.courseLevel,
          );

          if (existingGroup) {
            existingGroup.profiles.push(profile);
            return groups;
          }

          return [
            ...groups,
            { courseLevel: profile.courseLevel, profiles: [profile] },
          ];
        },
        [],
      ),
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
    setOutput(PLACEHOLDER_OUTPUT);
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
    setOutput("Generating feedback...");

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
    <main className="min-h-screen bg-[#f4f1ea] px-5 py-8 text-[#1f2927] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <header className="border-b border-[#ded8ce] pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#75684f]">
            Mindful Academic Review
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#17211f] sm:text-5xl">
            Mindful Academic Review
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#5b6661] sm:text-lg">
            Structured academic feedback for teachers and instructors.
          </p>
        </header>

        <section className="mt-8 grid gap-7 lg:grid-cols-[300px_minmax(0,1fr)_400px]">
          <aside className="rounded-xl border border-[#ded8ce] bg-[#fffefa] p-6 shadow-[0_1px_3px_rgba(32,38,35,0.06)] lg:sticky lg:top-8 lg:self-start">
            <h2 className="text-base font-semibold text-[#1d2524]">
              Saved Courses & Assignments
            </h2>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-[#394541]">
                Assignment/Profile Name
                <input
                  className="rounded-lg border border-[#d7d0c2] bg-[#fffdf8] px-3.5 py-2.5 text-base text-[#1f2927] outline-none transition placeholder:text-[#8b8478] focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                  onChange={(event) => setProfileName(event.target.value)}
                  value={profileName}
                />
              </label>

              <button
                className="rounded-lg bg-[#23413d] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(32,38,35,0.12)] transition hover:bg-[#1c3431]"
                onClick={saveCurrentProfile}
                type="button"
              >
                Save Current Assignment
              </button>
            </div>

            <div className="mt-6 space-y-5 border-t border-[#e3ddd3] pt-5">
              {groupedProfiles.length > 0 ? (
                groupedProfiles.map((group) => (
                  <div key={group.courseLevel}>
                    <h3 className="text-sm font-semibold text-[#27322f]">
                      {group.courseLevel}
                    </h3>
                    <div className="mt-2 grid gap-1.5">
                      {group.profiles.map((profile) => (
                        <button
                          className="rounded-lg px-3 py-2 text-left text-sm leading-5 text-[#5b6661] transition hover:bg-[#f4f1ea] hover:text-[#1d2524]"
                          key={`${profile.courseLevel}-${profile.name}`}
                          onClick={() => loadProfile(profile)}
                          type="button"
                        >
                          {profile.name}
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
            <section className="rounded-xl border border-[#ded8ce] bg-[#fffefa] p-6 shadow-[0_1px_3px_rgba(32,38,35,0.06)]">
              <h2 className="text-base font-semibold text-[#1d2524]">
                Review Mode
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(["basic", "advanced"] as Mode[]).map((modeOption) => (
                  <button
                    className={`rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${
                      mode === modeOption
                        ? "border-[#23413d] bg-[#23413d] text-white shadow-[0_1px_2px_rgba(32,38,35,0.12)]"
                        : "border-[#ded8ce] bg-[#fbfaf7] text-[#394541] hover:border-[#9b8a72] hover:bg-[#f7f3ea]"
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

            <section className="rounded-xl border border-[#ded8ce] bg-[#fffefa] p-6 shadow-[0_1px_3px_rgba(32,38,35,0.06)]">
              <h2 className="text-base font-semibold text-[#1d2524]">
                Assignment Details
              </h2>

              <div className="mt-5 grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-[#394541]">
                    Student Name
                    <input
                      className="rounded-lg border border-[#d7d0c2] bg-[#fffdf8] px-3.5 py-2.5 text-base text-[#1f2927] outline-none transition placeholder:text-[#8b8478] focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                      onChange={(event) => setStudentName(event.target.value)}
                      value={studentName}
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-[#394541]">
                    Course / Grade Level
                    <input
                      className="rounded-lg border border-[#d7d0c2] bg-[#fffdf8] px-3.5 py-2.5 text-base text-[#1f2927] outline-none transition placeholder:text-[#8b8478] focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                      onChange={(event) => setCourseLevel(event.target.value)}
                      value={courseLevel}
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-[#394541]">
                    Assignment Type
                    <select
                      className="rounded-lg border border-[#d7d0c2] bg-[#fffdf8] px-3.5 py-2.5 text-base text-[#1f2927] outline-none transition focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
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
                    className="min-h-28 rounded-lg border border-[#d7d0c2] bg-[#fffdf8] px-3.5 py-2.5 text-base text-[#1f2927] outline-none transition placeholder:text-[#8b8478] focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                    onChange={(event) =>
                      setAssignmentPrompt(event.target.value)
                    }
                    value={assignmentPrompt}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-[#394541]">
                  Assignment Requirements / Instructions
                  <textarea
                    className="min-h-32 rounded-lg border border-[#d7d0c2] bg-[#fffdf8] px-3.5 py-2.5 text-base text-[#1f2927] outline-none transition placeholder:text-[#8b8478] focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                    onChange={(event) =>
                      setAssignmentRequirements(event.target.value)
                    }
                    value={assignmentRequirements}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-[#394541]">
                  Student Submission
                  <textarea
                    className="min-h-56 rounded-lg border border-[#d7d0c2] bg-[#fffdf8] px-3.5 py-2.5 text-base text-[#1f2927] outline-none transition placeholder:text-[#8b8478] focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                    onChange={(event) =>
                      setStudentSubmission(event.target.value)
                    }
                    value={studentSubmission}
                  />
                </label>

                {mode === "advanced" ? (
                  <div className="grid gap-5 rounded-xl border border-[#e3ddd3] bg-[#fbfaf7] p-5">
                    <label className="grid gap-2 text-sm font-medium text-[#394541]">
                      Rubric
                      <textarea
                        className="min-h-36 rounded-lg border border-[#d7d0c2] bg-[#fffdf8] px-3.5 py-2.5 text-base text-[#1f2927] outline-none transition placeholder:text-[#8b8478] focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                        onChange={(event) => setRubric(event.target.value)}
                        value={rubric}
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-[#394541] sm:max-w-xs">
                      Citation Style
                      <select
                        className="rounded-lg border border-[#d7d0c2] bg-[#fffdf8] px-3.5 py-2.5 text-base text-[#1f2927] outline-none transition focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
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
              </div>
            </section>

            <button
              className="w-full rounded-lg bg-[#17211f] px-5 py-3.5 text-base font-semibold text-white shadow-[0_2px_5px_rgba(32,38,35,0.14)] transition hover:bg-[#23413d] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isGenerating}
              onClick={generateFeedback}
              type="button"
            >
              {isGenerating ? "Generating Feedback..." : "Generate Feedback"}
            </button>

            <section className="rounded-xl border border-[#ded8ce] bg-[#fffefa] p-6 shadow-[0_1px_3px_rgba(32,38,35,0.06)]">
              <h2 className="text-base font-semibold text-[#1d2524]">Reset</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-lg border border-[#c9c1b3] bg-[#fffdf8] px-4 py-2.5 text-sm font-semibold text-[#394541] transition hover:border-[#28433f] hover:bg-[#f7f3ea]"
                  onClick={clearStudentOnly}
                  type="button"
                >
                  Clear Student Only
                </button>
                <button
                  className="rounded-lg border border-[#c9c1b3] bg-[#fffdf8] px-4 py-2.5 text-sm font-semibold text-[#394541] transition hover:border-[#28433f] hover:bg-[#f7f3ea]"
                  onClick={clearOutputOnly}
                  type="button"
                >
                  Clear Output Only
                </button>
                <button
                  className="rounded-lg border border-[#d0b7ae] bg-[#fffdf8] px-4 py-2.5 text-sm font-semibold text-[#7a3327] transition hover:border-[#7a3327] hover:bg-[#fbf3f0]"
                  onClick={clearAll}
                  type="button"
                >
                  Clear All
                </button>
              </div>
            </section>
          </div>

          <aside className="rounded-xl border border-[#ded8ce] bg-[#fffefa] p-6 shadow-[0_1px_3px_rgba(32,38,35,0.06)] lg:sticky lg:top-8 lg:self-start">
            <h2 className="text-base font-semibold text-[#1d2524]">Output</h2>
            <div className="mt-4 min-h-[28rem] whitespace-pre-wrap rounded-xl border border-[#e3ddd3] bg-[#fbfaf7] p-5 text-sm leading-7 text-[#46524e]">
              {output}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <button
                className="rounded-lg border border-[#c9c1b3] bg-[#fffdf8] px-4 py-2.5 text-sm font-semibold text-[#394541] transition hover:border-[#28433f] hover:bg-[#f7f3ea]"
                onClick={copyOutput}
                type="button"
              >
                Copy Output
              </button>
              <button
                className="rounded-lg border border-[#c9c1b3] bg-[#fffdf8] px-4 py-2.5 text-sm font-semibold text-[#394541] transition hover:border-[#28433f] hover:bg-[#f7f3ea]"
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
