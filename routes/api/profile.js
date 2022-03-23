const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const keys = require("../../config/keys");

//Models
const User = require("../../model/User");
const Profile = require("../../model/Profile");

//Validators
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

const router = express.Router();

// @route   GET api/profile
// @desc    Display Current Logged-in User Profile
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then((profile) => {
        if (!profile) {
          errors.noProfile = "There is no profile for this user.";
          res.status(404).json(errors);
        }
        res.status(200).json(profile);
      })
      .catch((err) => {
        res.status(404).json(err);
      });
  }
);

// @route   GET api/profile/handle/:handle
// @desc    Display Current Logged-in User Profile by Handle
// @access  Public
router.get("/handle/:handle", (req, res, next) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then((profile) => {
      if (!profile) {
        errors.noProfile =
          "There is no profile for this user with this handle.";
        res.status(404).json(errors);
      }
      res.status(200).json(profile);
    })
    .catch((err) => {
      res.status(404).json(err);
    });
});

// @route   GET api/profile/user/:user_id
// @desc    Display Current Logged-in User Profile by User Id
// @access  Public
router.get("/user/:user_id", (req, res, next) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then((profile) => {
      if (!profile) {
        errors.noProfile =
          "There is no profile for this user with this handle.";
        res.status(404).json(errors);
      }
      res.status(200).json(profile);
    })
    .catch((err) => {
      res.status(404).json({
        noProfile: "There is no profile for this user with this handle.",
      });
    });
});

// @route   GET api/profile/all
// @desc    Display All User Profiles
// @access  Public
router.get("/all", (req, res, next) => {
  const errors = {};

  Profile.find()
    .populate("user", ["name", "avatar"])
    .then((profiles) => {
      if (!profiles) {
        errors.noProfiles = "There are no profiles to display.";
        res.status(404).json(errors);
      }
      res.status(200).json(profiles);
    })
    .catch((err) => {
      res.status(404).json({ noProfile: "There are no profiles to display." });
    });
});

// @route   POST api/profile
// @desc    Create or Edit Current Logged-in User Profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const { errors, isValid } = validateProfileInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    // Get Fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;

    //Skills
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }
    //Socials
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;

    Profile.findOne({ user: req.user.id }).then((profile) => {
      if (profile) {
        //Update Profile
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then((profile) => {
          res.status(200).json(profile);
        });
      } else {
        //Create Profile
        //Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then((profile) => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }
          new Profile(profileFields).save().then((profile) => {
            res.status(201).json(profile);
          });
        });
      }
    });
  }
);

// @route   POST api/profile/experience
// @desc    Add or Edit Current Logged-in User Profile Experience
// @access  Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then((profile) => {
      if (!profile) {
        errors.noProfile = "There is no profile for the user";
        return res.status(404).json(errors);
      }
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };

      profile.experience.unshift(newExp);
      profile.save().then((profile) => {
        res.status(200).json(profile);
      });
    });
  }
);

// @route   POST api/profile/education
// @desc    Add or Edit Current Logged-in User Profile Education
// @access  Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const { errors, isValid } = validateEducationInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then((profile) => {
      if (!profile) {
        errors.noProfile = "There is no profile for the user";
        return res.status(404).json(errors);
      }
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };

      profile.education.unshift(newEdu);
      profile.save().then((profile) => {
        res.status(200).json(profile);
      });
    });
  }
);

// @route   DELETE api/profile/experience/:id
// @desc    Delete the experience from a profile
// @access  Private
router.delete(
  "/experience/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          errors.noProfile = "There is no profile for the user";
          return res.status(404).json(errors);
        }

        //Get index
        const removeIndex = profile.experience
          .map((item) => item.id)
          .indexOf(req.params.id);

        //Delete from array
        profile.experience.splice(removeIndex, 1);

        profile.save().then((profile) => {
          res.status(200).json(profile);
        });
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
);

// @route   DELETE api/profile/education/:id
// @desc    Delete the education from a profile
// @access  Private
router.delete(
  "/education/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          errors.noProfile = "There is no profile for the user";
          return res.status(404).json(errors);
        }

        //Get index
        const removeIndex = profile.education
          .map((item) => item.id)
          .indexOf(req.params.id);

        //Delete from array
        profile.education.splice(removeIndex, 1);

        profile.save().then((profile) => {
          res.status(200).json(profile);
        });
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
);

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const errors = {};

    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() => {
        res.status(200).json({ success: true });
      });
    });
  }
);

module.exports = router;
