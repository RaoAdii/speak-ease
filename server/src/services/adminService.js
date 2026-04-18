import { Challenge } from "../models/Challenge.js";
import { ChallengeOption } from "../models/ChallengeOption.js";
import { Lesson } from "../models/Lesson.js";
import { Unit } from "../models/Unit.js";

export async function cascadeDeleteCourse(courseId) {
  const units = await Unit.find({ courseId }).lean();
  const unitIds = units.map((unit) => unit.id);

  const lessons = await Lesson.find({ unitId: { $in: unitIds } }).lean();
  const lessonIds = lessons.map((lesson) => lesson.id);

  const challenges = await Challenge.find({
    lessonId: { $in: lessonIds }
  }).lean();
  const challengeIds = challenges.map((challenge) => challenge.id);

  await ChallengeOption.deleteMany({ challengeId: { $in: challengeIds } });
  await Challenge.deleteMany({ lessonId: { $in: lessonIds } });
  await Lesson.deleteMany({ unitId: { $in: unitIds } });
  await Unit.deleteMany({ courseId });
}

export async function cascadeDeleteUnit(unitId) {
  const lessons = await Lesson.find({ unitId }).lean();
  const lessonIds = lessons.map((lesson) => lesson.id);

  const challenges = await Challenge.find({
    lessonId: { $in: lessonIds }
  }).lean();
  const challengeIds = challenges.map((challenge) => challenge.id);

  await ChallengeOption.deleteMany({ challengeId: { $in: challengeIds } });
  await Challenge.deleteMany({ lessonId: { $in: lessonIds } });
  await Lesson.deleteMany({ unitId });
}

export async function cascadeDeleteLesson(lessonId) {
  const challenges = await Challenge.find({ lessonId }).lean();
  const challengeIds = challenges.map((challenge) => challenge.id);

  await ChallengeOption.deleteMany({ challengeId: { $in: challengeIds } });
  await Challenge.deleteMany({ lessonId });
}

export async function cascadeDeleteChallenge(challengeId) {
  await ChallengeOption.deleteMany({ challengeId });
}
