const express = require("express");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const auth = require("../middlewares/auth");

const userRouter = new express.Router();

userRouter.post("/signup", async (req, res) => {
  const user = new User(req.body);
  try {
    const isExist = await User.isExist(req.body.email);
    if (isExist) {
      return res.status(409).send({ message: "Email is already exist" });
    }
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ token });
  } catch (e) {
    res.status(500).send({ message: "Internal server error" });
  }
});

userRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).send("Incorrect email or password");
    }
    const token = await user.generateAuthToken();
    res.status(200).send({ token });
  } catch (e) {
    res.status(500).send({ message: "Internal server error" });
  }
});

userRouter.post("/signout", auth, async (req, res) => {
  const user = req.user;
  try {
    user.tokens = user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await user.save();
    res.send();
  } catch (e) {
    res.status(500).send({ message: "Internal server error" });
  }
});

userRouter.post("/signoutAll", auth, async (req, res) => {
  const user = req.user;
  try {
    user.tokens = [];
    await user.save();
    res.send();
  } catch (e) {
    res.status(500).send({ message: "Internal server error" });
  }
});

userRouter.put("/update/gradeLevel", auth, async (req, res) => {
  const user = req.user;
  try {
    user.gradeLevel = req.body.gradeLevel;
    await user.save();
    res.send();
  } catch (e) {
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = userRouter;
