const express = require("express");
const router = express.Router({ mergeParams: true }); // to recieve parameters from app.js
const expressError = require("../../utils/expressError.js");
const wrapAsync = require("../../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../../schema.js");
const Review = require("../../models/review.js");
const Listing = require("../../models/listings.js");
const {
  validateReview,
  isLoggedin,
  isReviewAuthor,
} = require("../../middleware.js");
const reviewController = require("../controllers/review.js");

//REVIEWS ROUTES

router.post(
  "/",
  isLoggedin,
  validateReview,
  wrapAsync(reviewController.createReview),
);

// DELETE REVIEWS
router.delete(
  "/:reviewId",
  isLoggedin,
  wrapAsync(isReviewAuthor),
  wrapAsync(reviewController.destroyRoute),
);

module.exports = router;
