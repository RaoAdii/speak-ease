export const LESSON_TITLES = [
  "Nouns",
  "Verbs",
  "Adjectives",
  "Phrases",
  "Sentences"
];

export const UNIT_BLUEPRINT = [
  {
    title: "Unit 1",
    description: "Language fundamentals"
  },
  {
    title: "Unit 2",
    description: "Intermediate practice"
  }
];

export const CHALLENGE_BLUEPRINT = [
  { order: 1, type: "SELECT", concept: "man" },
  { order: 2, type: "SELECT", concept: "woman" },
  { order: 3, type: "SELECT", concept: "boy" },
  { order: 4, type: "ASSIST", concept: "man" },
  { order: 5, type: "SELECT", concept: "zombie" },
  { order: 6, type: "SELECT", concept: "robot" },
  { order: 7, type: "SELECT", concept: "girl" },
  { order: 8, type: "ASSIST", concept: "zombie" }
];

const OPTION_KEYS_BY_ORDER = {
  1: [
    { key: "man", correct: true, imageSrc: "/man.svg" },
    { key: "woman", correct: false, imageSrc: "/woman.svg" },
    { key: "boy", correct: false, imageSrc: "/boy.svg" }
  ],
  2: [
    { key: "woman", correct: true, imageSrc: "/woman.svg" },
    { key: "boy", correct: false, imageSrc: "/boy.svg" },
    { key: "man", correct: false, imageSrc: "/man.svg" }
  ],
  3: [
    { key: "woman", correct: false, imageSrc: "/woman.svg" },
    { key: "man", correct: false, imageSrc: "/man.svg" },
    { key: "boy", correct: true, imageSrc: "/boy.svg" }
  ],
  4: [
    { key: "woman", correct: false },
    { key: "man", correct: true },
    { key: "boy", correct: false }
  ],
  5: [
    { key: "man", correct: false, imageSrc: "/man.svg" },
    { key: "woman", correct: false, imageSrc: "/woman.svg" },
    { key: "zombie", correct: true, imageSrc: "/zombie.svg" }
  ],
  6: [
    { key: "robot", correct: true, imageSrc: "/robot.svg" },
    { key: "zombie", correct: false, imageSrc: "/zombie.svg" },
    { key: "boy", correct: false, imageSrc: "/boy.svg" }
  ],
  7: [
    { key: "girl", correct: true, imageSrc: "/girl.svg" },
    { key: "zombie", correct: false, imageSrc: "/zombie.svg" },
    { key: "man", correct: false, imageSrc: "/man.svg" }
  ],
  8: [
    { key: "woman", correct: false },
    { key: "zombie", correct: true },
    { key: "boy", correct: false }
  ]
};

export const LANGUAGE_COURSES = [
  {
    title: "Spanish",
    code: "es",
    imageSrc: "/es.svg",
    dictionary: {
      man: "el hombre",
      woman: "la mujer",
      boy: "el chico",
      zombie: "el zombie",
      robot: "el robot",
      girl: "la nina"
    },
    audio: {
      man: "/es_man.mp3",
      woman: "/es_woman.mp3",
      boy: "/es_boy.mp3",
      zombie: "/es_zombie.mp3",
      robot: "/es_robot.mp3",
      girl: "/es_girl.mp3"
    }
  },
  {
    title: "German",
    code: "de",
    imageSrc: "/de.svg",
    dictionary: {
      man: "der mann",
      woman: "die frau",
      boy: "der junge",
      zombie: "das zombie",
      robot: "der roboter",
      girl: "das maedchen"
    },
    audio: null
  },
  {
    title: "French",
    code: "fr",
    imageSrc: "/fr.svg",
    dictionary: {
      man: "l'homme",
      woman: "la femme",
      boy: "le garcon",
      zombie: "le zombie",
      robot: "le robot",
      girl: "la fille"
    },
    audio: null
  }
];

export function getLessonTitleByCode(courseCode, order) {
  return LESSON_TITLES[order - 1] || `Lesson ${order}`;
}

export function getUnitBlueprintByCode(courseCode) {
  return UNIT_BLUEPRINT;
}

function humanizeConcept(concept) {
  return String(concept || "").replace(/_/g, " ").trim();
}

export function getChallengeConceptByOrder(order) {
  const challenge = CHALLENGE_BLUEPRINT.find(
    (challengeBlueprint) => challengeBlueprint.order === order
  );

  if (!challenge) {
    return null;
  }

  return humanizeConcept(challenge.concept);
}

export function buildEnglishQuestion(challengeType, concept) {
  const normalizedConcept = humanizeConcept(concept);

  if (!normalizedConcept) {
    return challengeType === "ASSIST"
      ? "\"the highlighted term\""
      : "Select the correct translation.";
  }

  if (challengeType === "ASSIST") {
    return `\"${normalizedConcept}\"`;
  }

  return `Select the correct translation for \"${normalizedConcept}\".`;
}

export function getChallengeQuestion(course, challengeBlueprint) {
  const concept = getChallengeConceptByOrder(challengeBlueprint.order);
  return buildEnglishQuestion(challengeBlueprint.type, concept);
}

export function buildOptionsForChallenge(course, challengeOrder) {
  const optionBlueprint = OPTION_KEYS_BY_ORDER[challengeOrder] || [];

  return optionBlueprint.map((option) => ({
    correct: option.correct,
    text: course.dictionary[option.key],
    imageSrc: option.imageSrc || null,
    audioSrc: course.audio?.[option.key] || null
  }));
}
