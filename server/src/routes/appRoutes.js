import { Router } from "express";
import {
  completeLessonChallenge,
  failLessonChallenge,
  getCoursesPage,
  getLeaderboardPage,
  getLearnPage,
  getLessonPage,
  getQuestsPage,
  getShopPage,
  refillUserHearts,
  selectActiveCourse
} from "../controllers/appController.js";

const router = Router();

router.get("/courses", getCoursesPage);
router.post("/courses/select", selectActiveCourse);
router.get("/learn", getLearnPage);
router.get("/lesson", getLessonPage);
router.get("/lesson/:lessonId", getLessonPage);
router.get("/leaderboard", getLeaderboardPage);
router.get("/quests", getQuestsPage);
router.get("/shop", getShopPage);
router.post("/challenges/:challengeId/complete", completeLessonChallenge);
router.post("/challenges/:challengeId/fail", failLessonChallenge);
router.post("/hearts/refill", refillUserHearts);

export default router;
