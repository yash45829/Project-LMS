import { Router } from "express";
import {
  createCourse,
  createLecturesById,
  deleteCourse,
  getAllCourses,
  getCoursesById,
  removeLectureFromCourse,
  updateCourse,
} from "../controllers/course.controller.js";
import { autharizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

// ACCESS COURSES , CREATE COURSES (ADMIN)
router.get('/getAllCourses',getAllCourses)

router.post('/createCourse',
    isLoggedIn,
    autharizedRoles("ADMIN"), 
    upload.single("thumbnail"),
    createCourse
  );
  router.delete('/',
    isLoggedIn,
    autharizedRoles("ADMIN"), 
    removeLectureFromCourse
  );

//  COURSE BY ID , { UPDATE & DELETE COURSES , ADD LECTURES (ADMIN) }
router
  .route('/:id')
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
