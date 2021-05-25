const express = require("express");

const Course = require("../models/Course");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const auth = require("../middlewares/auth");

const courseRouter = new express.Router();

courseRouter.get("/view/all", async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.title) {
    match.title = req.query.title;
  }
  if (req.query.subject) {
    match.subject = req.query.subject;
  }
  if (req.query.gradeLevel) {
    match.gradeLevel = req.query.gradeLevel;
  }
  try {
    const courses = await Course.find(match)
      .limit(parseInt(req.query.limit))
      .skip(parseInt(req.query.skip));

    const response = await courses.map(async (course) => {
      const instructor = await User.findById(course.creator);
      course.instructor = instructor.name;
      const enrollments = await course.calculateRate();
      return {
        course,
        enrollments,
      };
    });
    Promise.all(response).then((data) => res.send(data));
  } catch (e) {
    res.status(500).send({ message: "Internal server error" });
  }
});

courseRouter.get("/view/enrolled", auth, async (req, res) => {
  const user = req.user;
  try {
    const enrollments = await Enrollment.find({ user: user._id }).select(
      "course"
    );
    await Enrollment.populate(enrollments, "course");
    const response = await enrollments.map(async (enrollment) => {
      const { course } = enrollment;
      const rate = await course.calculateRate();
      return {
        course,
        enrollments: rate,
      };
    });

    Promise.all(response).then((data) => res.send(data));
  } catch (e) {
    res.status(500).send({ message: "Internal server error" });
  }
});

courseRouter.get("/view/:id", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send({ message: "Course not found" });
    }
    const enrollments = await course.calculateRate();

    await course.populate("creator").execPopulate();
    res.send({ course, enrollments });
  } catch (e) {
    res.status(500).send({ message: "Internal server error" });
  }
});

courseRouter.post("/create", auth, async (req, res) => {
  try {
    const course = new Course({ ...req.body, creator: req.user });
    await course.save();
    res.status(201).send({ courseId: course._id });
  } catch (e) {
    res.status(500).send({ message: "Internal server error" });
  }
});

courseRouter.post("/enroll", auth, async (req, res) => {
  const user = req.user;
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(404).send({ message: "Course not found" });
    }

    const isEnrolled = await Enrollment.isEnrolled(user._id, course._id);
    if (isEnrolled) {
      return res.status(409).send({ message: "User already enrolled" });
    }

    enrollment = new Enrollment({ user: user._id, course: course._id });
    await enrollment.save();
    res.status(200).send();
  } catch (e) {
    res.status(500).send({ message: "Internal server error" });
  }
});

courseRouter.post("/review", auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.body.courseId,
    });
    if (!enrollment) {
      return res.status(401).send({ message: "User not enrolled" });
    }
    enrollment.rate = req.body.rate;
    enrollment.review = req.body.review;
    await enrollment.save();
    res.send();
  } catch (e) {
    res.status(500).send({ message: "Internal server error" });
  }
});

courseRouter.get("/reviews/:id", async (req, res) => {
  const user = req.user;
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send({ message: "Course not found" });
    }

    const enrollments = await Enrollment.find({
      course: req.params.id,
      review: { $ne: null },
    });

    await Enrollment.populate(enrollments, "user");

    res.send(enrollments);
  } catch (e) {
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = courseRouter;
