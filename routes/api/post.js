const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const keys = require("../../config/keys");

//Models
const User = require("../../model/User");
const Post = require("../../model/Post");
const Profile = require("../../model/Profile");

//Validators
const validatePostInput = require("../../validation/post");

const router = express.Router();

// @route   GET api/posts
// @desc    Get posts
// @access  Public
router.get("/", (req, res, next) => {
  const errors = {};

  Post.find()
    .sort({ date: -1 })
    .then((posts) => {
      if (!posts) {
        errors.posts = "There are not posts published yet.";
        return res.status(404).json(errors);
      }
      res.status(200).json(posts);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Public
router.get("/:id", (req, res, next) => {
  const errors = {};

  Post.findById(req.params.id)
    .then((post) => {
      if (!post) {
        errors.post = "Could not find the post with that id.";
        return res.status(404).json(errors);
      }
      res.status(200).json(post);
    })
    .catch((err) => {
      errors.post = "Could not find the post with that id.";
      res.status(400).json(errors);
    });
});

// @route   POST api/posts
// @desc    Create a post for the Current Logged-in User
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id,
    });

    newPost.save().then((post) => {
      res.status(201).json(post);
    });
  }
);

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const errors = {};

    Profile.findOne({ id: req.user.id }).then((profile) => {
      Post.findById(req.params.id)
        .then((post) => {
          //Check for post owner
          if (post.user.toString() !== req.user.id) {
            errors.post = "You are not authorized to delete this post";
            return res.status(401).json(errors);
          }
          post.remove().then(() => {
            res.status(200).json({ success: true });
          });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    });
  }
);

// @route   POST api/posts/like/:id
// @desc    Like a post
// @access  Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const errors = {};

    Profile.findOne({ id: req.user.id }).then((profile) => {
      Post.findById(req.params.id)
        .then((post) => {
          if (
            post.likes.filter((like) => like.user.toString() === req.user.id)
              .length > 0
          ) {
            errors.like = "You already liked this post.";
            return res.status(400).json(errors);
          }
          //Add user id to the likes array
          post.likes.unshift({ user: req.user.id });
          post.save().then((post) => {
            res.status(200).json(post);
          });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    });
  }
);

// @route   POST api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const errors = {};

    Profile.findOne({ id: req.user.id }).then((profile) => {
      Post.findById(req.params.id)
        .then((post) => {
          if (
            post.likes.filter((like) => like.user.toString() === req.user.id)
              .length === 0
          ) {
            errors.like = "You have not liked this post yet.";
            return res.status(400).json(errors);
          }
          //Get remove index
          const removeIndex = post.likes
            .map((item) => item.user.toString())
            .indexOf(req.user.id);
          post.likes.splice(removeIndex, 1);
          post.save().then((post) => {
            res.status(200).json(post);
          });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    });
  }
);

// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then((post) => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id,
        };

        post.comments.unshift(newComment);
        post.save().then((post) => {
          res.status(200).json(post);
        });
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete comment on a post
// @access  Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const errors = {};

    Post.findById(req.params.id)
      .then((post) => {
        //Check of the comment exists
        if (
          post.comments.filter(
            (comment) => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          errors.comment = "The comment does not exist";
          return res.status(404).json(errors);
        }

        //Get remove index
        const removeIndex = post.comments
          .map((item) => item._id.toString())
          .indexOf(req.params.comment_id);
        post.comments.splice(removeIndex, 1);
        post.save().then((post) => {
          res.status(200).json(post);
        });
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
);

module.exports = router;
