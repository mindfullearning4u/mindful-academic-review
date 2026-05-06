export type FacultyPreferences = {
  preferredFeedbackLength: "concise" | "standard" | "detailed";
  apaStrictness: "flexible" | "standard" | "strict";
  tonePreference: "supportive" | "balanced" | "direct";
  encouragementLevel: "light" | "moderate" | "high";
  assignmentTypeBehavior: "adaptive";
};

export const defaultFacultyPreferences: FacultyPreferences = {
  preferredFeedbackLength: "concise",
  apaStrictness: "standard",
  tonePreference: "supportive",
  encouragementLevel: "moderate",
  assignmentTypeBehavior: "adaptive",
};
