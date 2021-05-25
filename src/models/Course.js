const mongoose = require("mongoose");

const Enrollment = require("./Enrollment");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    longDescription: {
      type: String,
      trim: true,
    },
    gradeLevel: {
      type: Number /* [(1 - 12) , (0 => for non-students)] */,
      default: 0,
    },
    semester: {
      type: String /* ['First', 'Second', 'Both'] */,
      default: "Both",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    subject: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

courseSchema.virtual("lessons", {
  ref: "Lesson",
  localField: "_id",
  foreignField: "course",
});

// Calculate Average Rate of course

courseSchema.methods.calculateRate = async function () {
  const course = this;
  const enrollments = await Enrollment.find({ course: course._id });

  let total = 0;
  let count = 0;
  let oneCount = 0;
  let twoCount = 0;
  let threeCount = 0;
  let fourCount = 0;
  let fiveCount = 0;

  enrollments.forEach((enrollment) => {
    if (enrollment.rate) {
      total += enrollment.rate;
      count += 1;
      switch (enrollment.rate) {
        case 1:
          oneCount++;
          break;
        case 2:
          twoCount++;
          break;
        case 3:
          threeCount++;
          break;
        case 4:
          fourCount++;
          break;
        case 5:
          fiveCount++;
          break;
      }
    }
  });

  let rateRatios = 0;
  if (count > 0) {
    rateRatios = {
      oneRatio: Math.floor((oneCount / count) * 100),
      twoRatio: Math.floor((twoCount / count) * 100),
      threeRatio: Math.floor((threeCount / count) * 100),
      fourRatio: Math.floor((fourCount / count) * 100),
      fiveRatio: Math.floor((fiveCount / count) * 100),
    };
  }

  value = total / count || 0;
  return {
    rateValue: value,
    rateCount: count,
    enrollmentCount: enrollments.length,
    rateRatios,
  };
};

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
