const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  videoLink: {
    type: String,
    trim: true,
  },
  order: {
    type: Number,
    required: true,
  },
});

const Lesson = mongoose.model("Lesson", lessonSchema);

module.exports = Lesson;
