import { Router } from "express";
import { createAdminCrudController } from "../controllers/adminCrudController.js";
import { Challenge } from "../models/Challenge.js";
import { ChallengeOption } from "../models/ChallengeOption.js";
import { Course } from "../models/Course.js";
import { Lesson } from "../models/Lesson.js";
import { Unit } from "../models/Unit.js";
import {
  cascadeDeleteChallenge,
  cascadeDeleteCourse,
  cascadeDeleteLesson,
  cascadeDeleteUnit
} from "../services/adminService.js";

function buildCrudRoutes(controller) {
  const router = Router();
  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:id", controller.getOne);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.remove);
  return router;
}

const router = Router();

router.use(
  "/courses",
  buildCrudRoutes(
    createAdminCrudController({
      model: Course,
      resourceName: "courses",
      counterKey: "courses",
      beforeDelete: cascadeDeleteCourse
    })
  )
);

router.use(
  "/units",
  buildCrudRoutes(
    createAdminCrudController({
      model: Unit,
      resourceName: "units",
      counterKey: "units",
      beforeDelete: cascadeDeleteUnit
    })
  )
);

router.use(
  "/lessons",
  buildCrudRoutes(
    createAdminCrudController({
      model: Lesson,
      resourceName: "lessons",
      counterKey: "lessons",
      beforeDelete: cascadeDeleteLesson
    })
  )
);

router.use(
  "/challenges",
  buildCrudRoutes(
    createAdminCrudController({
      model: Challenge,
      resourceName: "challenges",
      counterKey: "challenges",
      beforeDelete: cascadeDeleteChallenge
    })
  )
);

router.use(
  "/challengeOptions",
  buildCrudRoutes(
    createAdminCrudController({
      model: ChallengeOption,
      resourceName: "challengeOptions",
      counterKey: "challengeOptions"
    })
  )
);

export default router;
