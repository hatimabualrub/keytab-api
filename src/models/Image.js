const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  source: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  image: {
    type: Buffer,
    required: true,
  },
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
