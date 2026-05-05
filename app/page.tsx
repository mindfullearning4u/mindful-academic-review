"use client";

import { useMemo, useState } from "react";

type Mode = "basic" | "advanced";
type CitationStyle = "APA" | "MLA" | "None";

type AssignmentProfile = {
  name: string;
  courseLevel: string;
  assignmentPrompt: string;
  assignmentRequirements: string;
  rubric: string;
  citationStyle: CitationStyle;
};

const STORAGE_KEY = "mindful-academic-review-profiles";
const PLACEHOLDER_OUTPUT = "Generated feedback will appear here.";

function getSavedProfiles() {
  if (typeof window === "undefined") {
    return [];
  }

  const savedProfiles = window.localStorage.getItem(STORAGE_KEY);

  if (!savedProfiles) {
    return [];
  }

  try {
    const parsed = JSON.parse(savedProfiles) as AssignmentProfile[];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("basic");
  const [studentName, setStudentName] = useState("");
  const [courseLevel, setCourseLevel] = useState("");
  const [assignmentPrompt, setAssignmentPrompt] = useState("");
  const [assignmentRequirements, setAssignmentRequirements] = useState("");
  const [studentSubmission, setStudentSubmission] = useState("");
  const [rubric, setRubric] = useState("");
  const [citationStyle, setCitationStyle] = useState<CitationStyle>("APA");
  const [profilesOpen, setProfilesOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("");
  const [profiles, setProfiles] =
    useState<AssignmentProfile[]>(getSavedProfiles);
  const [output, setOutput] = useState(PLACEHOLDER_OUTPUT);

  const selectedProfileData = useMemo(
    () => profiles.find((profile) => profile.name === selectedProfile),
    [profiles, selectedProfile],
  );

  function persistProfiles(nextProfiles: AssignmentProfile[]) {
    setProfiles(nextProfiles);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfiles));
  }

  function saveCurrentProfile() {
    const trimmedName = profileName.trim();

    if (!trimmedName) {
      return;
    }

    const nextProfile: AssignmentProfile = {
      name: trimmedName,
      courseLevel,
      assignmentPrompt,
      assignmentRequirements,
      rubric,
      citationStyle,
    };

    const remainingProfiles = profiles.filter(
      (profile) => profile.name !== trimmedName,
    );
    const nextProfiles = [...remainingProfiles, nextProfile].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    persistProfiles(nextProfiles);
    setSelectedProfile(trimmedName);
  }

  function loadSelectedProfile() {
    if (!selectedProfileData) {
      return;
    }

    setCourseLevel(selectedProfileData.courseLevel);
    setAssignmentPrompt(selectedProfileData.assignmentPrompt);
    setAssignmentRequirements(selectedProfileData.assignmentRequirements);
    setRubric(selectedProfileData.rubric);
    setCitationStyle(selectedProfileData.citationStyle);
  }

  function deleteSelectedProfile() {
    if (!selectedProfile) {
      return;
    }

    persistProfiles(
      profiles.filter((profile) => profile.name !== selectedProfile),
    );
    setSelectedProfile("");
  }

  function generateFeedback() {
    setOutput(PLACEHOLDER_OUTPUT);
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
    <main className="min-h-screen bg-[#f7f5ef] px-5 py-8 text-[#1d2524] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-[#d9d2c4] pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f5e43]">
            Mindful Academic Review
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-[#16201f] sm:text-5xl">
            Mindful Academic Review
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[#56615d]">
            Structured academic feedback for teachers and instructors.
          </p>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <section className="rounded-lg border border-[#d9d2c4] bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-[#1d2524]">
                Review Mode
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(["basic", "advanced"] as Mode[]).map((modeOption) => (
                  <button
                    className={`rounded-md border px-4 py-3 text-left text-sm font-semibold transition ${
                      mode === modeOption
                        ? "border-[#28433f] bg-[#28433f] text-white"
                        : "border-[#d9d2c4] bg-[#fbfaf7] text-[#394541] hover:border-[#9b8a72]"
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

            <section className="rounded-lg border border-[#d9d2c4] bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-[#1d2524]">
                Assignment Details
              </h2>

              <div className="mt-5 grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-[#394541]">
                    Student Name
                    <input
                      className="rounded-md border border-[#cfc6b6] bg-white px-3 py-2.5 text-base outline-none transition focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                      onChange={(event) => setStudentName(event.target.value)}
                      value={studentName}
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-[#394541]">
                    Course / Grade Level
                    <input
                      className="rounded-md border border-[#cfc6b6] bg-white px-3 py-2.5 text-base outline-none transition focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                      onChange={(event) => setCourseLevel(event.target.value)}
                      value={courseLevel}
                    />
                  </label>
                </div>

                <label className="grid gap-2 text-sm font-medium text-[#394541]">
                  Assignment Prompt
                  <textarea
                    className="min-h-28 rounded-md border border-[#cfc6b6] bg-white px-3 py-2.5 text-base outline-none transition focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                    onChange={(event) =>
                      setAssignmentPrompt(event.target.value)
                    }
                    value={assignmentPrompt}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-[#394541]">
                  Assignment Requirements / Instructions
                  <textarea
                    className="min-h-32 rounded-md border border-[#cfc6b6] bg-white px-3 py-2.5 text-base outline-none transition focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                    onChange={(event) =>
                      setAssignmentRequirements(event.target.value)
                    }
                    value={assignmentRequirements}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-[#394541]">
                  Student Submission
                  <textarea
                    className="min-h-52 rounded-md border border-[#cfc6b6] bg-white px-3 py-2.5 text-base outline-none transition focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                    onChange={(event) =>
                      setStudentSubmission(event.target.value)
                    }
                    value={studentSubmission}
                  />
                </label>

                {mode === "advanced" ? (
                  <div className="grid gap-5 rounded-md border border-[#e2dacb] bg-[#fbfaf7] p-4">
                    <label className="grid gap-2 text-sm font-medium text-[#394541]">
                      Rubric
                      <textarea
                        className="min-h-36 rounded-md border border-[#cfc6b6] bg-white px-3 py-2.5 text-base outline-none transition focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                        onChange={(event) => setRubric(event.target.value)}
                        value={rubric}
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-[#394541] sm:max-w-xs">
                      Citation Style
                      <select
                        className="rounded-md border border-[#cfc6b6] bg-white px-3 py-2.5 text-base outline-none transition focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
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

            <section className="rounded-lg border border-[#d9d2c4] bg-white shadow-sm">
              <button
                className="flex w-full items-center justify-between px-5 py-4 text-left text-base font-semibold text-[#1d2524]"
                onClick={() => setProfilesOpen((isOpen) => !isOpen)}
                type="button"
              >
                Saved Assignment Profiles
                <span className="text-sm text-[#6f5e43]">
                  {profilesOpen ? "Collapse" : "Expand"}
                </span>
              </button>

              {profilesOpen ? (
                <div className="grid gap-4 border-t border-[#e2dacb] p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium text-[#394541]">
                      Profile Name
                      <input
                        className="rounded-md border border-[#cfc6b6] bg-white px-3 py-2.5 text-base outline-none transition focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                        onChange={(event) => setProfileName(event.target.value)}
                        value={profileName}
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-[#394541]">
                      Selected Profile
                      <select
                        className="rounded-md border border-[#cfc6b6] bg-white px-3 py-2.5 text-base outline-none transition focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
                        onChange={(event) =>
                          setSelectedProfile(event.target.value)
                        }
                        value={selectedProfile}
                      >
                        <option value="">Select a profile</option>
                        {profiles.map((profile) => (
                          <option key={profile.name} value={profile.name}>
                            {profile.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      className="rounded-md bg-[#28433f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d312e]"
                      onClick={saveCurrentProfile}
                      type="button"
                    >
                      Save Current Assignment as Profile
                    </button>
                    <button
                      className="rounded-md border border-[#b8aa95] bg-white px-4 py-2.5 text-sm font-semibold text-[#394541] transition hover:border-[#28433f]"
                      onClick={loadSelectedProfile}
                      type="button"
                    >
                      Load Selected Profile
                    </button>
                    <button
                      className="rounded-md border border-[#b98979] bg-white px-4 py-2.5 text-sm font-semibold text-[#7a3327] transition hover:border-[#7a3327]"
                      onClick={deleteSelectedProfile}
                      type="button"
                    >
                      Delete Selected Profile
                    </button>
                  </div>
                </div>
              ) : null}
            </section>

            <button
              className="w-full rounded-md bg-[#16201f] px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-[#28433f]"
              onClick={generateFeedback}
              type="button"
            >
              Generate Feedback
            </button>
          </div>

          <aside className="rounded-lg border border-[#d9d2c4] bg-white p-5 shadow-sm lg:sticky lg:top-8 lg:self-start">
            <h2 className="text-base font-semibold text-[#1d2524]">Output</h2>
            <div className="mt-4 min-h-80 rounded-md border border-[#d9d2c4] bg-[#fbfaf7] p-4 text-sm leading-6 text-[#56615d]">
              {output}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <button
                className="rounded-md border border-[#b8aa95] bg-white px-4 py-2.5 text-sm font-semibold text-[#394541] transition hover:border-[#28433f]"
                onClick={copyOutput}
                type="button"
              >
                Copy Output
              </button>
              <button
                className="rounded-md border border-[#b8aa95] bg-white px-4 py-2.5 text-sm font-semibold text-[#394541] transition hover:border-[#28433f]"
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
