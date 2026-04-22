import {
  completeChallenge,
  getCourses,
  getCourseProgress,
  getLesson,
  getLessonPercentage,
  getQuizOverview,
  getQuizSession,
  getTopTenUsers,
  getUnits,
  getUserProgress,
  reduceHearts,
  refillHearts,
  selectCourse
} from "../services/appService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const QUIZ_TYPES = new Set([
  "mixed_mastery",
  "picture_focus",
  "meaning_focus",
  "rapid_review"
]);

function createBadRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function parseOptionalPositiveInt(rawValue, fieldName) {
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return undefined;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw createBadRequest(`${fieldName} must be a positive integer.`);
  }

  return parsedValue;
}

function parseRequiredPositiveInt(rawValue, fieldName) {
  const parsedValue = parseOptionalPositiveInt(rawValue, fieldName);

  if (!parsedValue) {
    throw createBadRequest(`${fieldName} is required.`);
  }

  return parsedValue;
}

export const getCoursesPage = asyncHandler(async (req, res) => {
  const [courses, userProgress] = await Promise.all([
    getCourses(),
    getUserProgress(req.user._id)
  ]);

  res.json({
    courses,
    activeCourseId: userProgress?.activeCourseId || null
  });
});

export const selectActiveCourse = asyncHandler(async (req, res) => {
  const courseId = parseRequiredPositiveInt(req.body?.courseId, "courseId");

  await selectCourse(req.user._id, courseId);

  res.json({ ok: true });
});

export const getLearnPage = asyncHandler(async (req, res) => {
  const [userProgress, courseProgress, lessonPercentage, units] = await Promise.all([
    getUserProgress(req.user._id),
    getCourseProgress(req.user._id),
    getLessonPercentage(req.user._id),
    getUnits(req.user._id)
  ]);

  res.json({
    userProgress,
    courseProgress,
    lessonPercentage,
    units
  });
});

export const getLessonPage = asyncHandler(async (req, res) => {
  const lessonId = parseOptionalPositiveInt(req.params.lessonId, "lessonId");

  const [lesson, userProgress] = await Promise.all([
    getLesson(req.user._id, lessonId),
    getUserProgress(req.user._id)
  ]);

  res.json({
    lesson,
    userProgress
  });
});

export const getQuizPage = asyncHandler(async (req, res) => {
  const [quizOverview, userProgress] = await Promise.all([
    getQuizOverview(req.user._id),
    getUserProgress(req.user._id)
  ]);

  res.json({
    quizOverview,
    userProgress
  });
});

export const getQuizSessionPage = asyncHandler(async (req, res) => {
  const lessonId = parseOptionalPositiveInt(req.params.lessonId, "lessonId");
  const quizType = typeof req.query.type === "string" ? req.query.type : undefined;
  const courseId = parseOptionalPositiveInt(req.query.courseId, "courseId");
  const topic = typeof req.query.topic === "string" ? req.query.topic : undefined;
  const questionCount = parseOptionalPositiveInt(req.query.n, "n");

  if (quizType && !QUIZ_TYPES.has(quizType)) {
    throw createBadRequest("type must be one of mixed_mastery, picture_focus, meaning_focus, rapid_review.");
  }

  if (
    questionCount !== undefined &&
    (questionCount < 5 || questionCount > 8)
  ) {
    throw createBadRequest("n must be between 5 and 8.");
  }

  const [lesson, userProgress] = await Promise.all([
    getQuizSession(req.user._id, lessonId, quizType, courseId, topic, questionCount),
    getUserProgress(req.user._id)
  ]);

  res.json({
    lesson,
    userProgress
  });
});

export const getLeaderboardPage = asyncHandler(async (req, res) => {
  const [userProgress, leaderboard] = await Promise.all([
    getUserProgress(req.user._id),
    getTopTenUsers()
  ]);

  res.json({
    userProgress,
    leaderboard
  });
});

export const getQuestsPage = asyncHandler(async (req, res) => {
  const [userProgress] = await Promise.all([getUserProgress(req.user._id)]);

  res.json({
    userProgress
  });
});

export const getShopPage = asyncHandler(async (req, res) => {
  const [userProgress] = await Promise.all([getUserProgress(req.user._id)]);

  res.json({
    userProgress
  });
});

export const completeLessonChallenge = asyncHandler(async (req, res) => {
  const challengeId = parseRequiredPositiveInt(
    req.params.challengeId,
    "challengeId"
  );
  const response = await completeChallenge(req.user._id, challengeId);
  res.json(response);
});

export const failLessonChallenge = asyncHandler(async (req, res) => {
  const challengeId = parseRequiredPositiveInt(
    req.params.challengeId,
    "challengeId"
  );
  const response = await reduceHearts(req.user._id, challengeId);
  res.json(response);
});

export const refillUserHearts = asyncHandler(async (req, res) => {
  const userProgress = await refillHearts(req.user._id);
  res.json({ userProgress });
});
