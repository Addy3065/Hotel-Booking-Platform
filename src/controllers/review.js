const Listing = require("../../models/listings");
const Review = require("../../models/review");

module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user_id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success", "New Review Added!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyRoute = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // deleting reviews from both listings and reviews database
  // $pull : operator removes from an existing array of all instances of a value or values that match a specified condt
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted!");

  res.redirect(`/listings/${id}`);
};
