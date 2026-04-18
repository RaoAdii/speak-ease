import { MAX_HEARTS, POINTS_TO_REFILL } from "../constants.js";
import { Challenge } from "../models/Challenge.js";
import { ChallengeOption } from "../models/ChallengeOption.js";
import { ChallengeProgress } from "../models/ChallengeProgress.js";
import { Course } from "../models/Course.js";
import { Lesson } from "../models/Lesson.js";
import { Unit } from "../models/Unit.js";
import { User } from "../models/User.js";
import { serializeUserProgress } from "./userSerializer.js";

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

export async function getCourses() {
  return Course.find().sort({ id: 1 }).lean();
}

export async function getCourseById(courseId) {
  return Course.findOne({ id: courseId }).lean();
}

export async function getUserProgress(userId) {
  const user = await User.findById(userId).lean();

  if (!user) {
    return null;
  }

  const activeCourse = user.activeCourseId
    ? await Course.findOne({ id: user.activeCourseId }).lean()
    : null;

  return serializeUserProgress(user, activeCourse);
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
  const user = await User.findById(userId).lean();

  if (!user?.activeCourseId) {
    return [];
  }

  return buildCourseTree(user.activeCourseId, userId);
}

export async function getCourseProgress(userId) {
  const user = await User.findById(userId).lean();

  if (!user?.activeCourseId) {
    return null;
  }

  const units = await buildCourseTree(user.activeCourseId, userId);

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
  const course = await Course.findOne({ id: courseId }).lean();

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
