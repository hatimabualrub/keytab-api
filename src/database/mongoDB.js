const mongoose = require("mongoose");
//mongodb://127.0.0.1:27017/keytab

// Connect To KeyTab Database
const connectDB = () => {
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then(() => console.log("Connected to KeyTab Database Successfully"))
    .catch(() => console.log("Connection Failed to KeyTab Database"));
};

module.exports = connectDB;
