const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const path = require("path");

//Routes Import
const users = require("./routes/api/user");
const profiles = require("./routes/api/profile");
const posts = require("./routes/api/post");
const { json } = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

//DB Config and connection
const db = require("./config/keys").mongoURI;
mongoose
  .connect(db)
  .then(() => console.log("DB connected..."))
  .catch((err) => console.log(err));

//----------Middleware JSON Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

//----------Passport Middleware
app.use(passport.initialize());
require("./config/passport")(passport);

//Routes Initialization
app.use("/api/users", users);
app.use("/api/profile", profiles);
app.use("/api/posts", posts);

//Server static assets if is in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("../client/build"));
  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname, "..", "client", "build", "index.html")
    );
  });
}

//Listening middlewares
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
