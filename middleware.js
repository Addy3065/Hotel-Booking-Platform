const Listing = require("./models/listings");
const review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const expressError = require("./utils/expressError.js");

module.exports.isLoggedin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //redirectUrl
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must Login");
    return res.redirect("/login");
  }
  next();
};
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let list = await Listing.findById(id);
  if (!list.owner.equals(res.locals.currentUser._id)) {
    req.flash("error", "AUKAT MAI ");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let list = await Review.findById(reviewId);
  if (!review.owner.equals(res.locals.currentUser._id)) {
    req.flash("error", "AUKAT MAI ");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(","); // to extract error message from each element is error(object)
    throw new expressError(400, errMsg);
  } else {
    next();
  }
};
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(","); // to extract error message from each element is error(object)
    throw new expressError(400, errMsg);
  } else {
    next();
  }
};
