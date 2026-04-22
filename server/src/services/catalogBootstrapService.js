import { getNextSequence } from "../utils/ids.js";
import { Challenge } from "../models/Challenge.js";
import { ChallengeOption } from "../models/ChallengeOption.js";
import { Course } from "../models/Course.js";
import { Lesson } from "../models/Lesson.js";
import { Unit } from "../models/Unit.js";
import { User } from "../models/User.js";
import {
  buildOptionsForChallenge,
  CHALLENGE_BLUEPRINT,
  getChallengeQuestion,
  getLessonTitleByCode,
  getUnitBlueprintByCode,
  LANGUAGE_COURSES
} from "../data/languageBlueprints.js";

let catalogEnsured = false;
let ensureInFlight = null;

async function ensureChallengeOptions(challengeId, expectedOptions) {
  const existingOptions = await ChallengeOption.find({ challengeId }).sort({ id: 1 });

  for (let index = 0; index < expectedOptions.length; index += 1) {
    const expected = expectedOptions[index];
    const existing = existingOptions[index];

    if (!existing) {
      await ChallengeOption.create({
        id: await getNextSequence("challengeOptions"),
        challengeId,
        ...expected
      });
      continue;
    }

    existing.correct = expected.correct;
    existing.text = expected.text;
    existing.imageSrc = expected.imageSrc;
    existing.audioSrc = expected.audioSrc;
    await existing.save();
  }

  if (existingOptions.length > expectedOptions.length) {
    const staleIds = existingOptions
      .slice(expectedOptions.length)
      .map((option) => option._id);

    await ChallengeOption.deleteMany({ _id: { $in: staleIds } });
  }
}

async function ensureLessonsForUnit(unit, languageCourse) {
  for (let lessonOrder = 1; lessonOrder <= 5; lessonOrder += 1) {
    const expectedLessonTitle = getLessonTitleByCode(languageCourse.code, lessonOrder);

    let lesson = await Lesson.findOne({ unitId: unit.id, order: lessonOrder });

    if (!lesson) {
      lesson = await Lesson.create({
        id: await getNextSequence("lessons"),
        unitId: unit.id,
        title: expectedLessonTitle,
        order: lessonOrder
      });
    } else if (lesson.title !== expectedLessonTitle) {
      lesson.title = expectedLessonTitle;
      await lesson.save();
    }

    for (const challengeBlueprint of CHALLENGE_BLUEPRINT) {
      const expectedQuestion = getChallengeQuestion(languageCourse, challengeBlueprint);

      let challenge = await Challenge.findOne({
        lessonId: lesson.id,
        order: challengeBlueprint.order
      });

      if (!challenge) {
        challenge = await Challenge.create({
          id: await getNextSequence("challenges"),
          lessonId: lesson.id,
          type: challengeBlueprint.type,
          question: expectedQuestion,
          order: challengeBlueprint.order
        });
      } else {
        challenge.type = challengeBlueprint.type;
        challenge.question = expectedQuestion;
        await challenge.save();
      }

      const expectedOptions = buildOptionsForChallenge(
        languageCourse,
        challengeBlueprint.order
      );

      await ensureChallengeOptions(challenge.id, expectedOptions);
    }
  }
}

async function ensureCourseStructure(languageCourse) {
  let course = await Course.findOne({ code: languageCourse.code });

  if (!course) {
    course = await Course.findOne({ title: languageCourse.title });
  }

  if (!course) {
    try {
      course = await Course.create({
        id: await getNextSequence("courses"),
        title: languageCourse.title,
        code: languageCourse.code,
        imageSrc: languageCourse.imageSrc
      });
    } catch (error) {
      // If another request created the same course code concurrently, re-use it.
      if (error?.code === 11000) {
        course = await Course.findOne({ code: languageCourse.code });
      } else {
        throw error;
      }
    }
  } else {
    course.title = languageCourse.title;
    course.imageSrc = languageCourse.imageSrc;

    if (!course.code) {
      course.code = languageCourse.code;
    }

    await course.save();
  }

  const legacyTitleCourses = await Course.find({
    _id: { $ne: course._id },
    title: languageCourse.title,
    $or: [{ code: { $exists: false } }, { code: null }, { code: "" }]
  }).lean();

  if (legacyTitleCourses.length > 0) {
    await User.updateMany(
      { activeCourseId: { $in: legacyTitleCourses.map((legacy) => legacy.id) } },
      { activeCourseId: course.id }
    );
  }

  const unitsBlueprint = getUnitBlueprintByCode(languageCourse.code);

  for (let unitOrder = 1; unitOrder <= unitsBlueprint.length; unitOrder += 1) {
    const expectedUnit = unitsBlueprint[unitOrder - 1];

    let unit = await Unit.findOne({ courseId: course.id, order: unitOrder });

    if (!unit) {
      unit = await Unit.create({
        id: await getNextSequence("units"),
        courseId: course.id,
        title: expectedUnit.title,
        description: expectedUnit.description,
        order: unitOrder
      });
    } else {
      unit.title = expectedUnit.title;
      unit.description = expectedUnit.description;
      await unit.save();
    }

    await ensureLessonsForUnit(unit, languageCourse);
  }
}

async function ensureLanguageCatalogInternal() {
  for (const languageCourse of LANGUAGE_COURSES) {
    await ensureCourseStructure(languageCourse);
  }
}

export async function ensureLanguageCatalog() {
  if (catalogEnsured) {
    return;
  }

  if (ensureInFlight) {
    await ensureInFlight;
    return;
  }

  ensureInFlight = ensureLanguageCatalogInternal()
    .then(() => {
      catalogEnsured = true;
    })
    .finally(() => {
      ensureInFlight = null;
    });

  await ensureInFlight;
}
