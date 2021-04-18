const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  gradeLevel: {
    type: Number /* [(1 - 12) , (0 => for non-students)] */,
    default: 0,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.virtual("createdCourses", {
  ref: "Course",
  localField: "_id",
  foreignField: "creator",
});

userSchema.methods.toJSON = function () {
  const user = this;
  const publicProfile = user.toObject();

  delete publicProfile.password;
  delete publicProfile.tokens;
  delete publicProfile.email;
  delete publicProfile.__v;
  return publicProfile;
};

// Check if email is exist
userSchema.statics.isExist = async (email) => {
  emailCount = await mongoose.models.User.countDocuments({ email });
  return emailCount > 0;
};

// Generate Json Web Token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
