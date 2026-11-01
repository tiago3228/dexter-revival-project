export const VIVIAN_FINAL_REQUIREMENTS = {
  clues: [
    "police-report",
    "scott-denial",
    "vivian-medical",
    "charles-secret",
    "henry-death",
    "code-0318",
  ],
  links: ["scott-versions", "vivian-charles"],
  locks: ["katherine-cabinet", "study-drawer", "gallery-safe"],
  timeline: ["letter-1973", "funds-1993", "vivian-1995", "hospital-1996"],
} as const;

export const VIVIAN_CASE_SAVE_KEY = "vivian-playable-investigation-v1";

export function readVivianCaseCompleted() {
  if (typeof window === "undefined") return false;
  try {
    const save = JSON.parse(window.localStorage.getItem(VIVIAN_CASE_SAVE_KEY) ?? "null");
    return save?.caseCompleted === true;
  } catch {
    return false;
  }
}

export type VivianAccusation = {
  suspect: string;
  weapon: string;
  motive: string;
};

export type VivianProgressForVerdict = {
  found: readonly string[];
  links: readonly string[];
  solvedCodeLocks: readonly string[];
  timelineOrder: readonly string[];
};

export function getVivianVerdictReadiness(progress: VivianProgressForVerdict) {
  const missingClues = VIVIAN_FINAL_REQUIREMENTS.clues.filter((id) => !progress.found.includes(id));
  const missingLinks = VIVIAN_FINAL_REQUIREMENTS.links.filter((id) => !progress.links.includes(id));
  const missingLocks = VIVIAN_FINAL_REQUIREMENTS.locks.filter(
    (id) => !progress.solvedCodeLocks.includes(id),
  );
  const timelineVerified = VIVIAN_FINAL_REQUIREMENTS.timeline.every(
    (id, index) => progress.timelineOrder[index] === id,
  );

  return {
    ready:
      missingClues.length === 0 &&
      missingLinks.length === 0 &&
      missingLocks.length === 0 &&
      timelineVerified,
    missingClues,
    missingLinks,
    missingLocks,
    timelineVerified,
  };
}

export function isCorrectVivianAccusation(accusation: VivianAccusation) {
  return (
    accusation.suspect === "matthew-brooks" &&
    accusation.motive === "revenge-for-sofia" &&
    accusation.weapon === "axe"
  );
}
