import {
  completeChallenge,
  getCourses,
  getCourseProgress,
  getLesson,
  getLessonPercentage,
  getTopTenUsers,
  getUnits,
  getUserProgress,
  reduceHearts,
  refillHearts,
  selectCourse
} from "../services/appService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
  await selectCourse(req.user._id, Number(req.body.courseId));

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
  const lessonId = req.params.lessonId ? Number(req.params.lessonId) : undefined;

  const [lesson, userProgress] = await Promise.all([
    getLesson(req.user._id, lessonId),
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
  const response = await completeChallenge(req.user._id, Number(req.params.challengeId));
  res.json(response);
});

export const failLessonChallenge = asyncHandler(async (req, res) => {
  const response = await reduceHearts(req.user._id, Number(req.params.challengeId));
  res.json(response);
});

export const refillUserHearts = asyncHandler(async (req, res) => {
  const userProgress = await refillHearts(req.user._id);
  res.json({ userProgress });
});
