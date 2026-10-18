const express = require("express");
const router = express.Router();
const wrapAsync = require("../../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../../schema.js");
const expressError = require("../../utils/expressError.js");
const Listing = require("../../models/listings.js");
const { isLoggedin, isOwner, validateListing } = require("../../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../../cloudConfig.js");
const upload = multer({ storage });

// middleware for validation of schema(JOI)

// INDEX ROUTE
router.route("/").get(wrapAsync(listingController.index)).post(
  isLoggedin,
  upload.single("list[image]"),
  validateListing, // validated using JOI middleware defined above ( JOI :FIRST layer of defence )
  wrapAsync(listingController.createListing),
);

// NEW ROUTE :
router.get("/new", isLoggedin, listingController.renderNewForm);

// show route
router.get("/:id", wrapAsync(listingController.showListings));

//EDIT route
const preserveTitleOnEdit = wrapAsync(async (req, res, next) => {
  let { id } = req.params;
  const existingListing = await Listing.findById(id);
  if (!existingListing) {
    // handle bad/deleted id cleanly instead of throwing on existingListing.title
    req.flash("error", "Listing you are trying to edit does not exist!");
    return res.redirect("/listings");
  }
  req.body.list = { ...(req.body.list || {}), title: existingListing.title };
  next();
});

router.get("/:id/edit", isLoggedin, wrapAsync(isOwner), wrapAsync(listingController.renderEdit));

router.put(
  "/:id",
  isLoggedin,
  wrapAsync(isOwner),
  upload.single("list[image]"),
  preserveTitleOnEdit, // needs req.body, which multer only fills in after parsing the multipart form
  validateListing, // JOI middleware
  wrapAsync(listingController.updateListing),
);

// DELETE Route
// with addition to reviews model changes are needed to be made to in listing deletion
router.delete(
  "/:id",
  isLoggedin,
  wrapAsync(isOwner),
  wrapAsync(listingController.destroyListing),
);

module.exports = router;
