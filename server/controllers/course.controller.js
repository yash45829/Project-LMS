import Course from "../models/course.model.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";

// LIST ALL COURSES
const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({}).select("-lectures");
    res.status(200).json({
      success: true,
      message: "courses loaded ",
      courses,
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

// COURSE BY ID
const getCoursesById = (req, res, next) => {
  try {
    const { id } = req.params;

    const course = Course.findById({ id });

    res.status(200).json({
      success: true,
      message: "courses",
      lecture: course.lectures,
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

// CREATE COURSE (ADMIN)
const createCourse = async (req, res, next) => {
  try {
    const { title, category, description, createdBy, thumbnail } = req.body;

    if (!title || !category || !description || !createdBy) {
      res.status(500).send(" fields are required");
    }
    const course = Course.create({
      title,
      category,
      description,
      createdBy,
      thumbnail: {
        public_id: "",
        secure_url: "",
      },
    });

    //  cloudinay upload 
    if (req.file) {
      const result = cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
      });
      if (result) {
        course.thumbnail.public_id = await result.public_id;
        course.thumbnail.secure_url = await result.secure_url;
      }

      fs.rm(`uploads/${req.file.filename}`);
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: "courses",
      course,
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

// UPDATE COURSE (ADMIN)
const updateCourse = (req, res, next) => {
  const id = req.params;

  const course = Course.findByIdAndUpdate(
    id,
    {
      $set: req.body,
    },
    {
      runValidators: true,
    }
  );
  if (!course) {
    res.status(500).send(" no course exist");
  }

  res.status(200).json({
    success: true,
    message: "course updated",
    course,
  });
};

// DELETE COURSE (ADMIN)
const deleteCourse = async (req, res, next) => {
  const id = req.params;

  const courseDeleted = await Course.findByIdAndDelete(id);

  if (!courseDeleted) {
    res.status(500).send("course not deleted");
  }

  res.status(200).json({
    success: true,
    message: "course deleted",
  });
};

// CREATE LECTURES TO COURSE BY ID (ADMIN)
const createLecturesById = async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;
  if (!title || !description) {
    res.status(500).send("title , descrption are not filled");
  }
  const course = await Course.findById(id);
  if (!course) {
    res.status(500).send("course not found");
  }

  const lectures = Course.create({
    title,
    description,
    lecture: {
      public_id: "",
      secure_url: "",
    },
  });

  //  cloudinay upload 
  if (req.file) {
    const result = cloudinary.v2.uploader.upload(req.file.path, {
      folder: "lms",
    });
    if (result) {
      lectures.lecture.public_id = await result.public_id;
      lectures.lecture.secure_url = await result.secure_url;
    }

    fs.rm(`uploads/${req.file.filename}`);
  }

  course.push(lectures);

  course.save();
};

export {
  getAllCourses,
  getCoursesById,
  createCourse,
  updateCourse,
  deleteCourse,
  createLecturesById,
};
