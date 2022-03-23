const express = require("express");
const keys = require("../../config/keys");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

//Models
const User = require("../../model/User");

//Validators
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

const router = express.Router();

// @route   POST api/users/register
// @desc    Register User
// @access  Public
router.post("/register", (req, res, next) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      errors.email = "Email already exists.";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", // Size of image
        r: "pg", // Rating of the image
        d: "mm", // Default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar: avatar,
        password: req.body.password,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            throw err;
          } else {
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                res.status(201).json(user);
              })
              .catch((err) => {
                res.status(400).json(err);
              });
          }
        });
      });
    }
  });
});

// @route   POST api/users/login
// @desc    Login User
// @access  Public
router.post("/login", (req, res, next) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  //Find User by email
  User.findOne({ email: email }).then((user) => {
    if (!user) {
      errors.email = "Email does not exist.";
      return res.status(404).json(errors);
    }

    //Check password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        //User matches (Create JWT Token)
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        };

        jwt.sign(
          payload,
          keys.secretJWT,
          { expiresIn: "30d" },
          (err, token) => {
            res.status(200).json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        errors.password = "Incorrect password";
        return res.status(400).json(errors);
      }
    });
  });
});

// @route   GET api/users/current
// @desc    Display Current Logged-in User
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(req.user);
  }
);

module.exports = router;
