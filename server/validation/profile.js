const Validator = require("validator");
const isEmpty = require("./is_empty");

module.exports = function validateProfileInput(data) {
  let errors = {};
  data.handle = !isEmpty(data.handle) ? data.handle : "";
  data.status = !isEmpty(data.status) ? data.status : "";
  data.skills = !isEmpty(data.skills) ? data.skills : "";

  if (!Validator.isLength(data.handle, { min: 2, max: 40 })) {
    errors.handle = "Handle must be between 2 and 40 characters";
  }

  if (Validator.isEmpty(data.handle)) {
    errors.handle = "Profile Handle field is required";
  }

  if (Validator.isEmpty(data.status)) {
    errors.status = "Status field is required";
  }

  if (Validator.isEmpty(data.skills)) {
    errors.skills = "Skills field is required";
  }

  if (!isEmpty(data.website) && !Validator.isURL(data.website)) {
    errors.website = "Website is not a valid URL";
  }

  if (!isEmpty(data.twitter) && !Validator.isURL(data.twitter)) {
    errors.twitter = "Twitter website is not a valid URL";
  }

  if (!isEmpty(data.youtube) && !Validator.isURL(data.youtube)) {
    errors.youtube = "Youtube website is not a valid URL";
  }

  if (!isEmpty(data.linkedin) && !Validator.isURL(data.linkedin)) {
    errors.linkedin = "Linkedin website is not a valid URL";
  }

  if (!isEmpty(data.instagram) && !Validator.isURL(data.instagram)) {
    errors.instagram = "Instagram website is not a valid URL";
  }

  if (!isEmpty(data.facebook) && !Validator.isURL(data.facebook)) {
    errors.facebook = "Facebook website is not a valid URL";
  }

  return {
    errors: errors,
    isValid: isEmpty(errors),
  };
};
