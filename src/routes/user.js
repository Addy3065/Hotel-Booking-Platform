const express = require("express");
const router = express.Router();
const User = require("../../models/users");
const wrapAsync = require("../../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../../middleware");
const userController = require("../controllers/users");

// SIGN UP
router.get("/signup", userController.userSignupForm);
router.post("/signup", wrapAsync(userController.userSignup));

//LOG-IN Page
router.get("/login", userController.userLoginForm);
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.userLogin,
);

//Log-Out
router.get("/logout", userController.userLogout);

module.exports = router;
