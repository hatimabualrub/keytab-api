const express = require("express");
const cors = require("cors");
require("dotenv").config();

const mongoDBConnect = require("./database/mongoDB");
const courseRouter = require("./routers/courseRouter");
const userRouter = require("./routers/userRuoter");
const lessonRouter = require("./routers/lessonRouter");
const imageRouter = require("./routers/imageRouter");

mongoDBConnect();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/users", userRouter);
app.use("/courses", courseRouter);
app.use("/lessons", lessonRouter);
app.use("/images", imageRouter);

app.listen(PORT, () =>
  console.log(`KeyTab API is up and Running on Port ${PORT}`)
);
