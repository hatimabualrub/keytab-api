const express = require("express");

const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const auth = require("../middlewares/auth");

const lessonRouter = new express.Router();

lessonRouter.get("/view/:id", auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    const lessonsList = await Lesson.find({ course: lesson.course });
    const nextLesson =
      lesson.order === lessonsList.length ? null : lessonsList[lesson.order];

    const previousLesson =
      lesson.order === 1 ? null : lessonsList[lesson.order - 2];

    if (!lesson) {
      return res.status(404).send({ message: "Lesson not found" });
    }
    const course = await Course.findById(lesson.course);
    const isEnrolled = await Enrollment.isEnrolled(req.user._id, lesson.course);
    if (!isEnrolled && !req.user._id.equals(course.creator)) {
      return res.status(409).send({ message: "User not enrolled" });
    }
    res.send({ lesson, lessonNav: { nextLesson, previousLesson } });
  } catch (e) {
    res.status(500).send({ message: "Internal server error" });
  }
});

lessonRouter.get("/view/course/:id", auth, async (req, res) => {
  const user = req.user;
  try {
    const course = await Course.findById(req.params.id);
    const isEnrolled = await Enrollment.isEnrolled(user._id, course._id);
    if (!isEnrolled && !user._id.equals(course.creator)) {
      return res.status(409).send({ message: "User not enrolled" });
    }
    await course.populate("lessons").execPopulate();
    res.send(course.lessons);
  } catch (e) {
    res.status(500).send({ message: "Internal server error" });
  }
});

lessonRouter.post("/create", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(404).send({ message: "Course not found" });
    }
    if (!course.creator.equals(req.user._id)) {
      return res.status(401).send({ message: "Unauthorized user" });
    }
    const lesson = new Lesson(req.body);
    await lesson.save();
    res.status(201).send();
  } catch (e) {
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = lessonRouter;
