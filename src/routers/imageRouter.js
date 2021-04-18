const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const Image = require("../models/Image");

const imageRouter = new express.Router();

const upload = multer({
  limits: {
    fileSize: 6000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
});

imageRouter.post(
  "/:id",
  upload.single("image"),
  async (req, res) => {
    const image = new Image();
    image.source = req.params.id;
    try {
      const imageBuffer = await sharp(req.file.buffer).png().toBuffer();
      image.image = imageBuffer;
      image.save();
      res.send();
    } catch (e) {
      res.status(500).send({ message: e.message });
    }
  },
  (error, req, res, next) => res.status(400).send({ message: error.message })
);

imageRouter.get("/:id", async (req, res) => {
  try {
    const image = await Image.findOne({ source: req.params.id });
    if (!image || !image.image) {
      return res.status(404).send({ message: "Image Not Found" });
    }
    res.set("Content-Type", "image/png");
    res.send(image.image);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

module.exports = imageRouter;
