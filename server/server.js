const express = require("express");
const mongoose = require("mongoose");

//Routes Import
const users = require("./routes/api/user");
const profiles = require("./routes/api/profile");
const posts = require("./routes/api/post");

const app = express();
const PORT = process.env.PORT || 5000;

//DB Config and connection
const db = require("./config/keys").mongoURI;
mongoose
  .connect(db)
  .then(() => console.log("DB connected..."))
  .catch((err) => console.log(err));

//Middlewares inits

//Routes Initialization
app.use("/api/users", users);
app.use("/api/profile", profiles);
app.use("/api/posts", posts);

//Listening middleware
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
