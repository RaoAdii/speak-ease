import { MAX_HEARTS, POINTS_TO_REFILL } from "../constants.js";
import { Challenge } from "../models/Challenge.js";
import { ChallengeOption } from "../models/ChallengeOption.js";
import { ChallengeProgress } from "../models/ChallengeProgress.js";
import { Course } from "../models/Course.js";
import { Lesson } from "../models/Lesson.js";
import { Unit } from "../models/Unit.js";
import { User } from "../models/User.js";
import {
  LANGUAGE_COURSES,
  buildEnglishQuestion,
  getChallengeConceptByOrder
} from "../data/languageBlueprints.js";
import { ensureLanguageCatalog } from "./catalogBootstrapService.js";
import { serializeUserProgress } from "./userSerializer.js";

const QUIZ_TYPE_LABELS = {
  mixed_mastery: {
    title: "Mixed Mastery",
    description: "Mixed translation and recognition questions"
  },
  picture_focus: {
    title: "Picture Focus",
    description: "Image-driven translation rounds"
  },
  meaning_focus: {
    title: "Meaning Focus",
    description: "Meaning-first translation practice"
  },
  rapid_review: {
    title: "Rapid Review",
    description: "Short high-speed recap"
  }
};

const QUIZ_LAUNCH_LABEL = "Start";
const COURSE_CODE_BY_TITLE = new Map(
  LANGUAGE_COURSES.map((course) => [course.title.toLowerCase(), course.code])
);
const COURSE_META_BY_CODE = new Map(
  LANGUAGE_COURSES.map((course) => [course.code, course])
);
const CATALOG_COURSE_CODES = LANGUAGE_COURSES.map((course) => course.code);
const CATALOG_COURSE_CODE_SET = new Set(CATALOG_COURSE_CODES);
const QUIZ_TYPE_SET = new Set(Object.keys(QUIZ_TYPE_LABELS));
const QUIZ_MIN_QUESTIONS = 5;
const QUIZ_MAX_QUESTIONS = 8;
const QUIZ_TARGET_COUNT_BY_TYPE = {
  mixed_mastery: QUIZ_MAX_QUESTIONS,
  picture_focus: QUIZ_MAX_QUESTIONS,
  meaning_focus: QUIZ_MAX_QUESTIONS,
  rapid_review: QUIZ_MIN_QUESTIONS
};
const QUIZ_OUTPUT_TYPE_BY_KEY = {
  mixed_mastery: "MIXED_MASTERY",
  picture_focus: "PICTURE_FOCUS",
  meaning_focus: "MEANING_FOCUS",
  rapid_review: "RAPID_REVIEW"
};
const DIFFICULTY_SEQUENCE = ["easy", "medium", "hard"];
const INTENT_SEQUENCE = ["conceptual", "application", "reasoning"];
const CONCEPT_DEFINITIONS = {
  man: "adult male person",
  woman: "adult female person",
  boy: "young male child",
  girl: "young female child",
  zombie: "fictional undead character",
  robot: "programmable machine"
};
const CONCEPT_VISUAL_DESCRIPTIONS = {
  man: "An adult male person standing.",
  woman: "An adult female person standing.",
  boy: "A young male child.",
  girl: "A young female child.",
  zombie: "A green zombie character with a scary look.",
  robot: "A metallic robot character."
};

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function shuffleItems(items) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

function clampQuizQuestionCount(value) {
  return Math.max(QUIZ_MIN_QUESTIONS, Math.min(QUIZ_MAX_QUESTIONS, value));
}

function addShuffledChallenges(targetMap, challenges, limit) {
  if (targetMap.size >= limit || !Array.isArray(challenges) || challenges.length === 0) {
    return;
  }

  for (const challenge of shuffleItems(challenges)) {
    if (!targetMap.has(challenge.id)) {
      targetMap.set(challenge.id, challenge);
    }

    if (targetMap.size >= limit) {
      return;
    }
  }
}

function buildMixedMasteryChallenges(challenges, desiredCount) {
  const selectedByChallengeId = new Map();
  const assistChallenges = challenges.filter((challenge) => challenge.type === "ASSIST");
  const selectChallenges = challenges.filter((challenge) => challenge.type === "SELECT");

  const minimumAssist = Math.min(
    assistChallenges.length,
    Math.max(1, Math.floor(desiredCount / 3))
  );
  const minimumSelect = Math.min(
    selectChallenges.length,
    Math.max(desiredCount - minimumAssist, 0)
  );

  addShuffledChallenges(selectedByChallengeId, assistChallenges, minimumAssist);
  addShuffledChallenges(
    selectedByChallengeId,
    selectChallenges,
    minimumAssist + minimumSelect
  );
  addShuffledChallenges(selectedByChallengeId, challenges, desiredCount);

  return [...selectedByChallengeId.values()];
}

function buildQuizTypePools(challenges, quizType) {
  const selectChallenges = challenges.filter((challenge) => challenge.type === "SELECT");
  const assistChallenges = challenges.filter((challenge) => challenge.type === "ASSIST");
  const selectWithImages = selectChallenges.filter((challenge) =>
    (challenge.challengeOptions || []).some((option) => Boolean(option.imageSrc))
  );
  const attemptedChallenges = challenges.filter(
    (challenge) => challenge.completed || (challenge.challengeProgress || []).length > 0
  );

  if (quizType === "picture_focus") {
    return {
      primary: selectWithImages,
      fallback: selectChallenges
    };
  }

  if (quizType === "meaning_focus") {
    return {
      primary: assistChallenges,
      fallback: assistChallenges
    };
  }

  if (quizType === "rapid_review") {
    return {
      primary: attemptedChallenges,
      fallback: challenges
    };
  }

  return {
    primary: challenges,
    fallback: challenges
  };
}

function getDifficultyByIndex(index) {
  return DIFFICULTY_SEQUENCE[index % DIFFICULTY_SEQUENCE.length];
}

function getIntentByIndex(index) {
  return INTENT_SEQUENCE[index % INTENT_SEQUENCE.length];
}

function normalizeConceptKey(value) {
  return normalizeText(value).replace(/\s+/g, "_");
}

function getConceptDetails(challenge) {
  const conceptLabel = getChallengeConceptByOrder(challenge.order) || "term";
  const conceptKey = normalizeConceptKey(conceptLabel);

  return {
    conceptLabel,
    conceptDefinition: CONCEPT_DEFINITIONS[conceptKey] || conceptLabel,
    imageDescription:
      CONCEPT_VISUAL_DESCRIPTIONS[conceptKey] || "A vocabulary image clue."
  };
}

function getCorrectOption(challenge) {
  return (challenge.challengeOptions || []).find((option) => option.correct) || null;
}

function buildOptionCatalog(challenges) {
  const optionMetaByText = new Map();

  for (const challenge of challenges) {
    for (const option of challenge.challengeOptions || []) {
      const optionText = String(option.text || "").trim();

      if (!optionText || optionMetaByText.has(optionText)) {
        continue;
      }

      optionMetaByText.set(optionText, {
        imageSrc: option.imageSrc || null,
        audioSrc: option.audioSrc || null
      });
    }
  }

  return {
    optionMetaByText,
    optionTexts: [...optionMetaByText.keys()]
  };
}

function buildMcqOptionSet({
  challengeId,
  correctAnswer,
  optionCatalog,
  includeImages = false,
  includeAudio = true
}) {
  const normalizedCorrectAnswer = normalizeText(correctAnswer);
  const distractors = shuffleItems(
    optionCatalog.optionTexts.filter(
      (optionText) => normalizeText(optionText) !== normalizedCorrectAnswer
    )
  ).slice(0, 3);
  const candidateTexts = shuffleItems([correctAnswer, ...distractors]).slice(0, 4);
  const usedNormalizedTexts = new Set(candidateTexts.map((optionText) => normalizeText(optionText)));

  if (candidateTexts.length < 4) {
    for (const optionText of optionCatalog.optionTexts) {
      const normalizedOptionText = normalizeText(optionText);

      if (!usedNormalizedTexts.has(normalizedOptionText)) {
        candidateTexts.push(optionText);
        usedNormalizedTexts.add(normalizedOptionText);
      }

      if (candidateTexts.length >= 4) {
        break;
      }
    }
  }

  return candidateTexts.slice(0, 4).map((optionText, index) => {
    const optionMeta = optionCatalog.optionMetaByText.get(optionText) || {};

    return {
      id: challengeId * 100 + index + 1,
      text: optionText,
      correct: normalizeText(optionText) === normalizedCorrectAnswer,
      imageSrc: includeImages ? optionMeta.imageSrc || null : null,
      audioSrc: includeAudio ? optionMeta.audioSrc || null : null
    };
  });
}

function buildQuestionText({
  quizType,
  format,
  intent,
  languageTitle,
  conceptLabel,
  conceptDefinition
}) {
  if (quizType === "picture_focus") {
    if (intent === "reasoning") {
      return `Use the image clue to choose the correct ${languageTitle} word.`;
    }

    if (intent === "application") {
      return `Look at the image and pick the best ${languageTitle} word.`;
    }

    return `Identify the correct ${languageTitle} word from the image.`;
  }

  if (quizType === "meaning_focus") {
    if (intent === "reasoning") {
      return `Which ${languageTitle} word best matches "${conceptDefinition}"?`;
    }

    return `Which ${languageTitle} word means "${conceptDefinition}"?`;
  }

  if (quizType === "rapid_review") {
    return `${languageTitle} word for "${conceptLabel}"?`;
  }

  if (format === "SHORT_ANSWER") {
    if (intent === "reasoning") {
      return `Type the most accurate ${languageTitle} translation for "${conceptLabel}".`;
    }

    if (intent === "application") {
      return `Type the ${languageTitle} word you would use for "${conceptLabel}".`;
    }

    return `Type the ${languageTitle} word that means "${conceptDefinition}".`;
  }

  if (intent === "reasoning") {
    return `Choose the best ${languageTitle} translation for "${conceptLabel}".`;
  }

  if (intent === "application") {
    return `You need a ${languageTitle} word for "${conceptDefinition}". Which option fits best?`;
  }

  return `Which ${languageTitle} word means "${conceptDefinition}"?`;
}

function buildQuestionFormat(quizType, index) {
  if (quizType === "rapid_review") {
    return "SHORT_ANSWER";
  }

  if (quizType === "mixed_mastery") {
    return index % 2 === 0 ? "MCQ" : "SHORT_ANSWER";
  }

  return "MCQ";
}

function buildGeneratedQuestionEntries({
  selectedChallenges,
  poolChallenges,
  quizType,
  languageTitle
}) {
  const optionCatalog = buildOptionCatalog(poolChallenges);

  return selectedChallenges.map((challenge, index) => {
    const format = buildQuestionFormat(quizType, index);
    const intent = getIntentByIndex(index);
    const difficulty = getDifficultyByIndex(index);
    const { conceptLabel, conceptDefinition, imageDescription } =
      getConceptDetails(challenge);
    const correctOption = getCorrectOption(challenge);
    const fallbackOption = (challenge.challengeOptions || [])[0] || null;
    const answer = correctOption?.text || fallbackOption?.text || "unknown";

    const question = buildQuestionText({
      quizType,
      format,
      intent,
      languageTitle,
      conceptLabel,
      conceptDefinition
    });

    let challengeOptions = [];
    let options = null;

    if (format === "MCQ") {
      const includeImages = quizType === "picture_focus";
      challengeOptions = buildMcqOptionSet({
        challengeId: challenge.id,
        correctAnswer: answer,
        optionCatalog,
        includeImages,
        includeAudio: true
      });
      options = challengeOptions.map((option) => option.text);
    }

    return {
      sourceChallenge: challenge,
      questionFormat: format,
      questionIntent: intent,
      strictQuestion: {
        id: index + 1,
        question,
        options,
        answer,
        image_description: quizType === "picture_focus" ? imageDescription : null,
        difficulty
      },
      challengeOptions
    };
  });
}

function resolveQuizTopic(overrideTopic, quizType, lesson) {
  const normalizedTopic = String(overrideTopic || "").trim();

  if (normalizedTopic) {
    return normalizedTopic;
  }

  const quizLabel = QUIZ_TYPE_LABELS[quizType]?.title;

  if (quizLabel) {
    return quizLabel;
  }

  return lesson?.title || "Quiz";
}

function mapBy(items, key) {
  return items.reduce((accumulator, item) => {
    const currentKey = item[key];
    if (!accumulator[currentKey]) {
      accumulator[currentKey] = [];
    }

    accumulator[currentKey].push(item);
    return accumulator;
  }, {});
}

function resolveCourseCode(course) {
  if (!course) {
    return null;
  }

  const code = normalizeText(course.code);

  if (CATALOG_COURSE_CODE_SET.has(code)) {
    return code;
  }

  const titleKey = normalizeText(course.title);
  return COURSE_CODE_BY_TITLE.get(titleKey) || null;
}

async function getCatalogCourses() {
  await ensureLanguageCatalog();
  const allCourses = await Course.find().sort({ id: 1 }).lean();
  const canonicalByCode = new Map();

  for (const course of allCourses) {
    const code = resolveCourseCode(course);

    if (!code) {
      continue;
    }

    const existing = canonicalByCode.get(code);

    if (!existing || course.id < existing.id) {
      canonicalByCode.set(code, course);
    }
  }

  return CATALOG_COURSE_CODES.map((code) => {
    const canonicalCourse = canonicalByCode.get(code);

    if (!canonicalCourse) {
      return null;
    }

    const meta = COURSE_META_BY_CODE.get(code);

    return {
      ...canonicalCourse,
      code,
      title: meta?.title || canonicalCourse.title,
      imageSrc: canonicalCourse.imageSrc || meta?.imageSrc || null
    };
  }).filter(Boolean);
}

async function resolveCanonicalCourseId(activeCourseId, userId) {
  if (!activeCourseId) {
    return null;
  }

  const catalogCourses = await getCatalogCourses();
  const exactCourse = catalogCourses.find((course) => course.id === activeCourseId);

  if (exactCourse) {
    return exactCourse.id;
  }

  const currentCourse = await Course.findOne({ id: activeCourseId }).lean();
  const courseCode = resolveCourseCode(currentCourse);
  const canonicalCourse = catalogCourses.find((course) => course.code === courseCode);

  if (!canonicalCourse) {
    return null;
  }

  await User.findByIdAndUpdate(userId, { activeCourseId: canonicalCourse.id });

  return canonicalCourse.id;
}

function getEnglishQuestionForChallenge(challenge) {
  const concept = getChallengeConceptByOrder(challenge.order);
  return buildEnglishQuestion(challenge.type, concept);
}

export async function getCourses() {
  return getCatalogCourses();
}

export async function getCourseById(courseId) {
  const catalogCourses = await getCatalogCourses();

  return catalogCourses.find((course) => course.id === courseId) || null;
}

export async function getUserProgress(userId) {
  await ensureLanguageCatalog();
  const user = await User.findById(userId).lean();

  if (!user) {
    return null;
  }

  const activeCourseId = await resolveCanonicalCourseId(user.activeCourseId, userId);
  const catalogCourses = await getCatalogCourses();
  const activeCourse = activeCourseId
    ? catalogCourses.find((course) => course.id === activeCourseId) || null
    : null;

  return serializeUserProgress(
    {
      ...user,
      activeCourseId: activeCourseId || null
    },
    activeCourse
  );
}

async function buildCourseTree(courseId, userId) {
  const units = await Unit.find({ courseId }).sort({ order: 1 }).lean();

  if (!units.length) {
    return [];
  }

  const lessons = await Lesson.find({
    unitId: { $in: units.map((unit) => unit.id) }
  })
    .sort({ order: 1 })
    .lean();

  const challenges = await Challenge.find({
    lessonId: { $in: lessons.map((lesson) => lesson.id) }
  })
    .sort({ order: 1 })
    .lean();

  const progress = await ChallengeProgress.find({
    userId,
    challengeId: { $in: challenges.map((challenge) => challenge.id) }
  }).lean();

  const progressByChallengeId = mapBy(progress, "challengeId");
  const challengesByLessonId = mapBy(
    challenges.map((challenge) => ({
      ...challenge,
      challengeProgress: progressByChallengeId[challenge.id] || []
    })),
    "lessonId"
  );

  const lessonsByUnitId = mapBy(
    lessons.map((lesson) => {
      const lessonChallenges = challengesByLessonId[lesson.id] || [];

      const completed =
        lessonChallenges.length > 0 &&
        lessonChallenges.every(
          (challenge) =>
            challenge.challengeProgress.length > 0 &&
            challenge.challengeProgress.every((entry) => entry.completed)
        );

      return {
        ...lesson,
        challenges: lessonChallenges,
        completed
      };
    }),
    "unitId"
  );

  return units.map((unit) => ({
    ...unit,
    lessons: (lessonsByUnitId[unit.id] || []).sort((a, b) => a.order - b.order)
  }));
}

export async function getUnits(userId) {
  await ensureLanguageCatalog();
  const user = await User.findById(userId).lean();

  if (!user?.activeCourseId) {
    return [];
  }

  const activeCourseId = await resolveCanonicalCourseId(user.activeCourseId, userId);

  if (!activeCourseId) {
    return [];
  }

  return buildCourseTree(activeCourseId, userId);
}

export async function getCourseProgress(userId) {
  await ensureLanguageCatalog();
  const user = await User.findById(userId).lean();

  if (!user?.activeCourseId) {
    return null;
  }

  const activeCourseId = await resolveCanonicalCourseId(user.activeCourseId, userId);

  if (!activeCourseId) {
    return null;
  }

  const units = await buildCourseTree(activeCourseId, userId);

  const firstUncompletedLesson = units
    .flatMap((unit) =>
      unit.lessons.map((lesson) => ({
        ...lesson,
        unit
      }))
    )
    .find((lesson) =>
      lesson.challenges.some(
        (challenge) =>
          challenge.challengeProgress.length === 0 ||
          challenge.challengeProgress.some((entry) => !entry.completed)
      )
    );

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id
  };
}

export async function getLesson(userId, lessonId) {
  await ensureLanguageCatalog();
  const targetLessonId =
    lessonId || (await getCourseProgress(userId))?.activeLessonId;

  if (!targetLessonId) {
    return null;
  }

  const lesson = await Lesson.findOne({ id: targetLessonId }).lean();

  if (!lesson) {
    return null;
  }

  const challenges = await Challenge.find({ lessonId: lesson.id })
    .sort({ order: 1 })
    .lean();

  const options = await ChallengeOption.find({
    challengeId: { $in: challenges.map((challenge) => challenge.id) }
  })
    .sort({ id: 1 })
    .lean();

  const progress = await ChallengeProgress.find({
    userId,
    challengeId: { $in: challenges.map((challenge) => challenge.id) }
  }).lean();

  const optionsByChallengeId = mapBy(options, "challengeId");
  const progressByChallengeId = mapBy(progress, "challengeId");

  return {
    ...lesson,
    challenges: challenges.map((challenge) => {
      const challengeProgress = progressByChallengeId[challenge.id] || [];

      return {
        ...challenge,
        question: getEnglishQuestionForChallenge(challenge),
        challengeOptions: optionsByChallengeId[challenge.id] || [],
        challengeProgress,
        completed:
          challengeProgress.length > 0 &&
          challengeProgress.every((entry) => entry.completed)
      };
    })
  };
}

export async function getLessonPercentage(userId) {
  const courseProgress = await getCourseProgress(userId);

  if (!courseProgress?.activeLessonId) {
    return 0;
  }

  const lesson = await getLesson(userId, courseProgress.activeLessonId);

  if (!lesson?.challenges.length) {
    return 0;
  }

  const completedChallenges = lesson.challenges.filter(
    (challenge) => challenge.completed
  );

  return Math.round(
    (completedChallenges.length / lesson.challenges.length) * 100
  );
}

function normalizeQuizType(quizType) {
  if (!quizType) {
    return "mixed_mastery";
  }

  return QUIZ_TYPE_SET.has(quizType) ? quizType : "mixed_mastery";
}

async function getCourseChallenges(userId, courseId) {
  const units = await Unit.find({ courseId }).sort({ order: 1 }).lean();

  if (!units.length) {
    return [];
  }

  const lessons = await Lesson.find({ unitId: { $in: units.map((unit) => unit.id) } })
    .sort({ order: 1 })
    .lean();

  if (!lessons.length) {
    return [];
  }

  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const challenges = await Challenge.find({
    lessonId: { $in: lessons.map((lesson) => lesson.id) }
  })
    .sort({ order: 1 })
    .lean();

  if (!challenges.length) {
    return [];
  }

  const options = await ChallengeOption.find({
    challengeId: { $in: challenges.map((challenge) => challenge.id) }
  })
    .sort({ id: 1 })
    .lean();

  const progress = await ChallengeProgress.find({
    userId,
    challengeId: { $in: challenges.map((challenge) => challenge.id) }
  }).lean();

  const optionsByChallengeId = mapBy(options, "challengeId");
  const progressByChallengeId = mapBy(progress, "challengeId");

  return challenges
    .map((challenge) => {
      const challengeProgress = progressByChallengeId[challenge.id] || [];

      return {
        ...challenge,
        lesson: lessonById.get(challenge.lessonId) || null,
        challengeOptions: optionsByChallengeId[challenge.id] || [],
        challengeProgress,
        completed:
          challengeProgress.length > 0 &&
          challengeProgress.every((entry) => entry.completed)
      };
    })
    .sort((leftChallenge, rightChallenge) => {
      const leftLesson = leftChallenge.lesson;
      const rightLesson = rightChallenge.lesson;

      if (!leftLesson || !rightLesson) {
        return leftChallenge.order - rightChallenge.order;
      }

      if (leftLesson.order !== rightLesson.order) {
        return leftLesson.order - rightLesson.order;
      }

      return leftChallenge.order - rightChallenge.order;
    });
}

export async function getQuizOverview(userId) {
  await ensureLanguageCatalog();
  const [courses, user] = await Promise.all([
    getCatalogCourses(),
    User.findById(userId).lean()
  ]);
  const canonicalActiveCourseId = await resolveCanonicalCourseId(
    user?.activeCourseId,
    userId
  );

  const languages = [];

  for (const course of courses) {
    const units = await buildCourseTree(course.id, userId);
    const lessons = units.flatMap((unit) =>
      unit.lessons.map((lesson) => ({
        ...lesson,
        unitTitle: unit.title
      }))
    );

    const suggestedLesson = lessons.find((lesson) => !lesson.completed) || lessons[0];
    const pictureLesson =
      lessons.find((lesson) =>
        lesson.challenges.some((challenge) => challenge.type === "SELECT")
      ) || suggestedLesson;
    const meaningLesson =
      lessons.find((lesson) =>
        lesson.challenges.some((challenge) => challenge.type === "ASSIST")
      ) || suggestedLesson;

    languages.push({
      courseId: course.id,
      code: course.code,
      title: course.title,
      imageSrc: course.imageSrc,
      launchLabel: QUIZ_LAUNCH_LABEL,
      quizTypes: [
        {
          key: "mixed_mastery",
          lessonId: suggestedLesson?.id || null,
          title: QUIZ_TYPE_LABELS.mixed_mastery.title,
          description: QUIZ_TYPE_LABELS.mixed_mastery.description,
          topic: QUIZ_TYPE_LABELS.mixed_mastery.title,
          questionCount: QUIZ_TARGET_COUNT_BY_TYPE.mixed_mastery
        },
        {
          key: "picture_focus",
          lessonId: pictureLesson?.id || null,
          title: QUIZ_TYPE_LABELS.picture_focus.title,
          description: QUIZ_TYPE_LABELS.picture_focus.description,
          topic: QUIZ_TYPE_LABELS.picture_focus.title,
          questionCount: QUIZ_TARGET_COUNT_BY_TYPE.picture_focus
        },
        {
          key: "meaning_focus",
          lessonId: meaningLesson?.id || null,
          title: QUIZ_TYPE_LABELS.meaning_focus.title,
          description: QUIZ_TYPE_LABELS.meaning_focus.description,
          topic: QUIZ_TYPE_LABELS.meaning_focus.title,
          questionCount: QUIZ_TARGET_COUNT_BY_TYPE.meaning_focus
        },
        {
          key: "rapid_review",
          lessonId: suggestedLesson?.id || null,
          title: QUIZ_TYPE_LABELS.rapid_review.title,
          description: QUIZ_TYPE_LABELS.rapid_review.description,
          topic: QUIZ_TYPE_LABELS.rapid_review.title,
          questionCount: QUIZ_TARGET_COUNT_BY_TYPE.rapid_review
        }
      ].filter((quizType) => Boolean(quizType.lessonId))
    });
  }

  return {
    activeCourseId: canonicalActiveCourseId || null,
    languages
  };
}

export async function getQuizSession(
  userId,
  lessonId,
  quizType = "mixed_mastery",
  courseId,
  topic,
  questionCount
) {
  await ensureLanguageCatalog();
  const normalizedQuizType = normalizeQuizType(quizType);
  const targetLessonId = lessonId || (await getCourseProgress(userId))?.activeLessonId;

  if (!targetLessonId) {
    return null;
  }

  const lesson = await Lesson.findOne({ id: targetLessonId }).lean();

  if (!lesson) {
    return null;
  }

  const lessonUnit = await Unit.findOne({ id: lesson.unitId }).lean();

  if (!lessonUnit) {
    return null;
  }

  if (courseId && lessonUnit.courseId !== courseId) {
    return null;
  }

  const resolvedCourseId = courseId || lessonUnit.courseId;
  const allCourseChallenges = await getCourseChallenges(userId, resolvedCourseId);

  if (!allCourseChallenges.length) {
    return null;
  }

  const challengesOutsideCurrentLesson = allCourseChallenges.filter(
    (challenge) => challenge.lessonId !== lesson.id
  );
  const primaryPool =
    challengesOutsideCurrentLesson.length > 0
      ? challengesOutsideCurrentLesson
      : allCourseChallenges;
  const targetCountForType =
    QUIZ_TARGET_COUNT_BY_TYPE[normalizedQuizType] ?? QUIZ_MAX_QUESTIONS;
  const desiredCount = clampQuizQuestionCount(questionCount || targetCountForType);
  let selectedChallenges = [];

  if (normalizedQuizType === "mixed_mastery") {
    selectedChallenges = buildMixedMasteryChallenges(primaryPool, desiredCount);

    if (selectedChallenges.length < QUIZ_MIN_QUESTIONS) {
      const selectedByChallengeId = new Map(
        selectedChallenges.map((challenge) => [challenge.id, challenge])
      );
      addShuffledChallenges(selectedByChallengeId, primaryPool, QUIZ_MIN_QUESTIONS);
      selectedChallenges = [...selectedByChallengeId.values()];
    }
  } else {
    const pools = buildQuizTypePools(primaryPool, normalizedQuizType);
    const selectedByChallengeId = new Map();

    addShuffledChallenges(selectedByChallengeId, pools.primary, desiredCount);
    addShuffledChallenges(selectedByChallengeId, pools.fallback, desiredCount);

    if (selectedByChallengeId.size < QUIZ_MIN_QUESTIONS) {
      addShuffledChallenges(selectedByChallengeId, primaryPool, QUIZ_MIN_QUESTIONS);
    }

    selectedChallenges = [...selectedByChallengeId.values()];
  }

  selectedChallenges = shuffleItems(selectedChallenges)
    .slice(0, desiredCount);

  if (!selectedChallenges.length) {
    return null;
  }

  const course = await getCourseById(resolvedCourseId);
  const languageTitle = course?.title || "Language";
  const resolvedTopic = resolveQuizTopic(topic, normalizedQuizType, lesson);
  const generatedEntries = buildGeneratedQuestionEntries({
    selectedChallenges,
    poolChallenges: primaryPool,
    quizType: normalizedQuizType,
    languageTitle
  });
  const strictQuestionSet = {
    topic: resolvedTopic,
    question_type:
      QUIZ_OUTPUT_TYPE_BY_KEY[normalizedQuizType] || QUIZ_OUTPUT_TYPE_BY_KEY.mixed_mastery,
    questions: generatedEntries.map((entry) => entry.strictQuestion)
  };
  const generatedChallenges = generatedEntries.map((entry, index) => ({
    ...entry.sourceChallenge,
    type: entry.questionFormat === "MCQ" ? "SELECT" : "ASSIST",
    order: index + 1,
    question: entry.strictQuestion.question,
    challengeOptions: entry.challengeOptions,
    questionFormat: entry.questionFormat,
    expectedAnswer: entry.strictQuestion.answer,
    imageDescription: entry.strictQuestion.image_description,
    difficulty: entry.strictQuestion.difficulty,
    questionIntent: entry.questionIntent
  }));

  return {
    ...lesson,
    topic: strictQuestionSet.topic,
    questionType: strictQuestionSet.question_type,
    questionSet: strictQuestionSet,
    challenges: generatedChallenges
  };
}

export async function getTopTenUsers() {
  return User.find()
    .sort({ points: -1 })
    .limit(10)
    .select({ name: 1, imageSrc: 1, points: 1 })
    .lean()
    .then((users) =>
      users.map((user) => ({
        userId: user._id.toString(),
        userName: user.name,
        userImageSrc: user.imageSrc,
        points: user.points
      }))
    );
}

export async function selectCourse(userId, courseId) {
  await ensureLanguageCatalog();
  const catalogCourses = await getCatalogCourses();
  const course = catalogCourses.find((catalogCourse) => catalogCourse.id === courseId);

  if (!course) {
    throw new Error("Course not found.");
  }

  const firstUnit = await Unit.findOne({ courseId }).sort({ order: 1 }).lean();

  if (!firstUnit) {
    throw new Error("Course is empty.");
  }

  const firstLesson = await Lesson.findOne({ unitId: firstUnit.id })
    .sort({ order: 1 })
    .lean();

  if (!firstLesson) {
    throw new Error("Course is empty.");
  }

  await User.findByIdAndUpdate(userId, { activeCourseId: courseId });
}

export async function reduceHearts(userId, challengeId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  const challenge = await Challenge.findOne({ id: challengeId }).lean();

  if (!challenge) {
    throw new Error("Challenge not found.");
  }

  const existingProgress = await ChallengeProgress.findOne({
    userId,
    challengeId
  }).lean();

  if (existingProgress) {
    return { error: "practice" };
  }

  if (user.hearts === 0) {
    return { error: "hearts" };
  }

  user.hearts = Math.max(user.hearts - 1, 0);
  await user.save();

  return {
    lessonId: challenge.lessonId,
    hearts: user.hearts
  };
}

export async function refillHearts(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User progress not found.");
  }

  if (user.hearts === MAX_HEARTS) {
    throw new Error("Hearts are already full.");
  }

  if (user.points < POINTS_TO_REFILL) {
    throw new Error("Not enough points.");
  }

  user.hearts = MAX_HEARTS;
  user.points -= POINTS_TO_REFILL;
  await user.save();

  return serializeUserProgress(user);
}

export async function completeChallenge(userId, challengeId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User progress not found.");
  }

  const challenge = await Challenge.findOne({ id: challengeId }).lean();

  if (!challenge) {
    throw new Error("Challenge not found.");
  }

  const existingProgress = await ChallengeProgress.findOne({
    userId,
    challengeId
  });

  const isPractice = Boolean(existingProgress);

  if (user.hearts === 0 && !isPractice) {
    return { error: "hearts" };
  }

  if (isPractice) {
    existingProgress.completed = true;
    await existingProgress.save();
    user.hearts = Math.min(user.hearts + 1, MAX_HEARTS);
    user.points += 10;
    await user.save();

    return {
      practice: true,
      hearts: user.hearts,
      points: user.points
    };
  }

  await ChallengeProgress.create({
    userId,
    challengeId,
    completed: true
  });

  user.points += 10;
  await user.save();

  return {
    practice: false,
    hearts: user.hearts,
    points: user.points
  };
}
