import Course from "../models/course.model.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";

// LIST ALL COURSES
const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({}).select("-lectures");
    if (!courses) {
      return res.status(500).json({
        message: "no course available",
      });
    }
    res.status(200).json({
      success: true,
      message: "courses loaded ",
      courses,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

// COURSE BY ID
const getCoursesById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id);
    const course = await Course.findById(id);
    if (!course) {
      return res.status(500).json({
        message: "no course found",
      });
    }
    console.log(course);

    res.status(200).json({
      success: true,
      message: "courses",
      lecture: course.lectures,
    });
  } catch (e) {
    res.status(500).json({
      message: "no course err",
    });
  }
};

// CREATE COURSE (ADMIN)
const createCourse = async (req, res, next) => {
  try {
    const { title, category, description, createdBy } = req.body;

    if (!title || !category || !description || !createdBy || !(req.file)) {
      res.status(500).json({
        message: " fields are required",
      });
    }
    const course = await Course.create({
      title,
      category,
      description,
      createdBy,
      thumbnail: {
        public_id: "",
        secure_url: "",
      },
    });

    if (!course) {
      return res.status(500).json({
        message: "not created",
      });
    }

    //  cloudinay upload
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
      });
      if (result) {
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;
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
    res.status(500).json({
      message: e.message,
    });
  }
};

// UPDATE COURSE (ADMIN)
const updateCourse = (req, res, next) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      message: e.message,
    });
  }
};

// DELETE COURSE (ADMIN)
const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const courseDeleted = await Course.findByIdAndDelete(id);

    if (!courseDeleted) {
      res.status(500).send("course not deleted");
    }

    res.status(200).json({
      success: true,
      message: "course deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: e.message,
    });
  }
};

const removeLectureFromCourse = async (req, res, next) => {
  const { courseId, lectureId } = req.query;
  try {
    if (!courseId || !lectureId) {
      res.status(500).json({
        message: "prm not fullfilled",
      });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(500).json({
        message: "no course found  ",
      });
    }
    const lectureIndex = course.lectures.findIndex(
      (lecture) => lecture._id.toString() === lectureId.toString()
    );
    if (lectureIndex === -1) {
      res.status(500).json({
        message: "no lecture found  ",
      });
    }
    await cloudinary.v2.uploader.destroy(
      course.lectures[lectureIndex].lecture.public_id,
      {
        resource_type: "video",
      }
    );
    await course.lectures.splice(lectureIndex, 1);
    course.noOfLectures = await course.lectures.length;
    await course.save();
    res.status(200).json({
      success: true,
      message: "lecture deleted",
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
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
  let lectureData = {
    title,
    description,
    lecture: {},
  };

  console.log("lecture");
  //  cloudinay upload
  try {
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
        chunk_size: 50000000, // 50 mb size
        resource_type: "video",
      });
      if (result) {
        console.log(result);
        lectureData.lecture.public_id = await result.public_id;
        lectureData.lecture.secure_url = await result.secure_url;
      }

      fs.rm(`uploads/${req.file.filename}`);
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
  console.log("upload");

  course.lectures.push(lectureData);

  course.noOfLectures = course.lectures.length;
  console.log("done");
  await course.save();
  res.status(200).json({
    success: true,
    message: "lecture added",
  });
};

export {
  getAllCourses,
  getCoursesById,
  createCourse,
  updateCourse,
  deleteCourse,
  createLecturesById,
  removeLectureFromCourse,
};
