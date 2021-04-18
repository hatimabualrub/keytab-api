const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  rate: {
    type: Number /* (0 - 5)*/,
  },
  review: {
    type: String,
    trim: true,
  },
});

enrollmentSchema.statics.isEnrolled = async function (userId, courseId) {
  const enrollment = await Enrollment.findOne({
    user: userId,
    course: courseId,
  });

  return enrollment ? true : false;
};

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

module.exports = Enrollment;
