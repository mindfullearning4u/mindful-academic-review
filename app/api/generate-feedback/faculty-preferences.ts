export type FacultyPreferences = {
  preferredFeedbackLength: "concise" | "standard" | "detailed";
  apaStrictness: "flexible" | "standard" | "strict";
  tonePreference: "supportive" | "balanced" | "direct";
  encouragementLevel: "light" | "moderate" | "high";
  gradingStrictness: "flexible" | "standard" | "rigorous";
  instructorPersonalityAlignment:
    | "warm"
    | "balanced"
    | "highly_direct";
  assignmentTypeBehavior: "adaptive";
  discussionSpecificBehavior: {
    prioritizeEngagement: boolean;
    encouragePeerConnection: boolean;
  };
  finalPaperBehavior: {
    prioritizeSynthesis: boolean;
    emphasizePolish: boolean;
  };
};

export const defaultFacultyPreferences: FacultyPreferences = {
  preferredFeedbackLength: "concise",
  apaStrictness: "standard",
  tonePreference: "supportive",
  encouragementLevel: "moderate",
  gradingStrictness: "standard",
  instructorPersonalityAlignment: "warm",
  assignmentTypeBehavior: "adaptive",
  discussionSpecificBehavior: {
    prioritizeEngagement: true,
    encouragePeerConnection: true,
  },
  finalPaperBehavior: {
    prioritizeSynthesis: true,
    emphasizePolish: true,
  },
};
