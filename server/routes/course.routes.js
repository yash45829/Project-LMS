import { Router } from "express";
import {
  createCourse,
  createLecturesById,
  deleteCourse,
  getAllCourses,
  getCoursesById,
  updateCourse,
} from "../controllers/course.controller";
import { autharizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware";

const router = Router();

// ACCESS COURSES , CREATE COURSES (ADMIN)
router
  .route("/")
  .get(getAllCourses)
  .post(
    isLoggedIn,
    autharizedRoles("ADMIN"),
    upload.single("thumbnail"),
    createCourse
  );

//  COURSE BY ID , { UPDATE & DELETE COURSES , ADD LECTURES (ADMIN) }
router
  .route("/:id")
  .get(isLoggedIn, getCoursesById)
  .put(isLoggedIn, autharizedRoles("ADMIN"), updateCourse)
  .delete(isLoggedIn, autharizedRoles("ADMIN"), deleteCourse)
  .post(
    isLoggedIn,
    autharizedRoles("ADMIN"),
    upload.single("lecture"),
    createLecturesById
  );

export default router;