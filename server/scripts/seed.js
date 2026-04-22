import { connectDatabase } from "../src/config/db.js";
import { Challenge } from "../src/models/Challenge.js";
import { ChallengeOption } from "../src/models/ChallengeOption.js";
import { ChallengeProgress } from "../src/models/ChallengeProgress.js";
import { Counter } from "../src/models/Counter.js";
import { Course } from "../src/models/Course.js";
import { Lesson } from "../src/models/Lesson.js";
import { Unit } from "../src/models/Unit.js";
import { User } from "../src/models/User.js";
import {
  buildOptionsForChallenge,
  CHALLENGE_BLUEPRINT,
  getChallengeQuestion,
  getLessonTitleByCode,
  getUnitBlueprintByCode,
  LANGUAGE_COURSES
} from "../src/data/languageBlueprints.js";
import { getNextSequence } from "../src/utils/ids.js";

async function createCourse(data) {
  return Course.create({ ...data, id: await getNextSequence("courses") });
}

async function createUnit(data) {
  return Unit.create({ ...data, id: await getNextSequence("units") });
}

async function createLesson(data) {
  return Lesson.create({ ...data, id: await getNextSequence("lessons") });
}

async function createChallenge(data) {
  return Challenge.create({ ...data, id: await getNextSequence("challenges") });
}

async function createChallengeOption(data) {
  return ChallengeOption.create({
    ...data,
    id: await getNextSequence("challengeOptions")
  });
}

async function resetDatabase() {
  await Promise.all([
    Counter.deleteMany({}),
    ChallengeProgress.deleteMany({}),
    ChallengeOption.deleteMany({}),
    Challenge.deleteMany({}),
    Lesson.deleteMany({}),
    Unit.deleteMany({}),
    Course.deleteMany({}),
    User.deleteMany({})
  ]);
}

async function seed() {
  await connectDatabase();
  await resetDatabase();

  for (const languageCourse of LANGUAGE_COURSES) {
    const course = await createCourse({
      title: languageCourse.title,
      code: languageCourse.code,
      imageSrc: languageCourse.imageSrc
    });

    const units = [];
    const unitBlueprint = getUnitBlueprintByCode(languageCourse.code);

    for (let unitIndex = 0; unitIndex < unitBlueprint.length; unitIndex += 1) {
      units.push(
        await createUnit({
          courseId: course.id,
          title: unitBlueprint[unitIndex].title,
          description: unitBlueprint[unitIndex].description,
          order: unitIndex + 1
        })
      );
    }

    for (const unit of units) {
      const lessons = [];

      for (let lessonOrder = 1; lessonOrder <= 5; lessonOrder += 1) {
        lessons.push(
          await createLesson({
            unitId: unit.id,
            title: getLessonTitleByCode(languageCourse.code, lessonOrder),
            order: lessonOrder
          })
        );
      }

      for (const lesson of lessons) {
        const challenges = [];

        for (const challengeData of CHALLENGE_BLUEPRINT) {
          challenges.push(
            await createChallenge({
              lessonId: lesson.id,
              type: challengeData.type,
              question: getChallengeQuestion(languageCourse, challengeData),
              order: challengeData.order
            })
          );
        }

        for (const challenge of challenges) {
          const options = buildOptionsForChallenge(languageCourse, challenge.order);

          for (const option of options) {
            await createChallengeOption({
              challengeId: challenge.id,
              ...option
            });
          }
        }
      }
    }
  }

  console.log("MongoDB seeded successfully.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Failed to seed MongoDB", error);
  process.exit(1);
});
