import { connectDatabase } from "../src/config/db.js";
import { Challenge } from "../src/models/Challenge.js";
import { ChallengeOption } from "../src/models/ChallengeOption.js";
import { ChallengeProgress } from "../src/models/ChallengeProgress.js";
import { Counter } from "../src/models/Counter.js";
import { Course } from "../src/models/Course.js";
import { Lesson } from "../src/models/Lesson.js";
import { Unit } from "../src/models/Unit.js";
import { User } from "../src/models/User.js";
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

  const course = await createCourse({
    title: "Spanish",
    imageSrc: "/es.svg"
  });

  const units = [];
  units.push(
    await createUnit({
      courseId: course.id,
      title: "Unit 1",
      description: `Learn the basics of ${course.title}`,
      order: 1
    })
  );
  units.push(
    await createUnit({
      courseId: course.id,
      title: "Unit 2",
      description: `Learn intermediate ${course.title}`,
      order: 2
    })
  );

  for (const unit of units) {
    const lessons = [];

    for (const lessonData of [
      { title: "Nouns", order: 1 },
      { title: "Verbs", order: 2 },
      { title: "Adjectives", order: 3 },
      { title: "Phrases", order: 4 },
      { title: "Sentences", order: 5 }
    ]) {
      lessons.push(
        await createLesson({
          unitId: unit.id,
          ...lessonData
        })
      );
    }

    for (const lesson of lessons) {
      const challenges = [];

      for (const challengeData of [
        { type: "SELECT", question: 'Which one of these is "the man"?', order: 1 },
        { type: "SELECT", question: 'Which one of these is "the woman"?', order: 2 },
        { type: "SELECT", question: 'Which one of these is "the boy"?', order: 3 },
        { type: "ASSIST", question: '"the man"', order: 4 },
        { type: "SELECT", question: 'Which one of these is "the zombie"?', order: 5 },
        { type: "SELECT", question: 'Which one of these is "the robot"?', order: 6 },
        { type: "SELECT", question: 'Which one of these is "the girl"?', order: 7 },
        { type: "ASSIST", question: '"the zombie"', order: 8 }
      ]) {
        challenges.push(
          await createChallenge({
            lessonId: lesson.id,
            ...challengeData
          })
        );
      }

      for (const challenge of challenges) {
        const optionsByOrder = {
          1: [
            { correct: true, text: "el hombre", imageSrc: "/man.svg", audioSrc: "/es_man.mp3" },
            { correct: false, text: "la mujer", imageSrc: "/woman.svg", audioSrc: "/es_woman.mp3" },
            { correct: false, text: "el chico", imageSrc: "/boy.svg", audioSrc: "/es_boy.mp3" }
          ],
          2: [
            { correct: true, text: "la mujer", imageSrc: "/woman.svg", audioSrc: "/es_woman.mp3" },
            { correct: false, text: "el chico", imageSrc: "/boy.svg", audioSrc: "/es_boy.mp3" },
            { correct: false, text: "el hombre", imageSrc: "/man.svg", audioSrc: "/es_man.mp3" }
          ],
          3: [
            { correct: false, text: "la mujer", imageSrc: "/woman.svg", audioSrc: "/es_woman.mp3" },
            { correct: false, text: "el hombre", imageSrc: "/man.svg", audioSrc: "/es_man.mp3" },
            { correct: true, text: "el chico", imageSrc: "/boy.svg", audioSrc: "/es_boy.mp3" }
          ],
          4: [
            { correct: false, text: "la mujer", audioSrc: "/es_woman.mp3" },
            { correct: true, text: "el hombre", audioSrc: "/es_man.mp3" },
            { correct: false, text: "el chico", audioSrc: "/es_boy.mp3" }
          ],
          5: [
            { correct: false, text: "el hombre", imageSrc: "/man.svg", audioSrc: "/es_man.mp3" },
            { correct: false, text: "la mujer", imageSrc: "/woman.svg", audioSrc: "/es_woman.mp3" },
            { correct: true, text: "el zombie", imageSrc: "/zombie.svg", audioSrc: "/es_zombie.mp3" }
          ],
          6: [
            { correct: true, text: "el robot", imageSrc: "/robot.svg", audioSrc: "/es_robot.mp3" },
            { correct: false, text: "el zombie", imageSrc: "/zombie.svg", audioSrc: "/es_zombie.mp3" },
            { correct: false, text: "el chico", imageSrc: "/boy.svg", audioSrc: "/es_boy.mp3" }
          ],
          7: [
            { correct: true, text: "la nina", imageSrc: "/girl.svg", audioSrc: "/es_girl.mp3" },
            { correct: false, text: "el zombie", imageSrc: "/zombie.svg", audioSrc: "/es_zombie.mp3" },
            { correct: false, text: "el hombre", imageSrc: "/man.svg", audioSrc: "/es_man.mp3" }
          ],
          8: [
            { correct: false, text: "la mujer", audioSrc: "/es_woman.mp3" },
            { correct: true, text: "el zombie", audioSrc: "/es_zombie.mp3" },
            { correct: false, text: "el chico", audioSrc: "/es_boy.mp3" }
          ]
        };

        for (const option of optionsByOrder[challenge.order]) {
          await createChallengeOption({
            challengeId: challenge.id,
            ...option
          });
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
