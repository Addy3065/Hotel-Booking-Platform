const Listing = require("../../models/listings");
const expressError = require("../../utils/expressError");
const geocode = require("../../utils/geocode");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports.index = async (req, res) => {
  const location = (req.query.location || "").trim();
  let filter = {};
  if (location) {
    // search by location (city/area) or country, case-insensitive
    const regex = new RegExp(escapeRegex(location), "i");
    filter = { $or: [{ location: regex }, { country: regex }] };
  }
  // only the ratings are needed to show each listing's average on the cards
  const allListing = await Listing.find(filter).populate("reviews", "rating");
  res.render("listings/index.ejs", { allListing, location });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};
module.exports.showListings = async (req, res) => {
  let { id } = req.params;
  const list = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!list) {
    req.flash("error", "Listing Does Not Exist!");
    return res.redirect("/listings");
  }
  // older listings (e.g. seeded before geometry was saved) have no coordinates: look them up once and store them
  if (!list.geometry || !list.geometry.coordinates || list.geometry.coordinates.length !== 2) {
    try {
      const geometry = await geocode(`${list.location}, ${list.country}`);
      if (geometry) {
        list.geometry = geometry;
        await Listing.updateOne({ _id: list._id }, { geometry });
      }
    } catch (err) {
      console.log("geocoding failed:", err.message);
    }
  }
  // console.log(list);
  res.render("listings/show.ejs", { list });
};

module.exports.createListing = async (req, res) => {
  if (!req.file) {
    throw new expressError(400, "Please upload an image of the property");
  }
  const geometry = await geocode(`${req.body.list.location}, ${req.body.list.country}`);
  if (!geometry) {
    throw new expressError(400, "Could not find that location on the map");
  }

  let url = req.file.path;
  let filename = req.file.filename;
  let list = req.body.list;
  let newList = new Listing(list);
  newList.owner = req.user._id;
  newList.image = { url, filename };
  newList.geometry = geometry;
  let savedListing = await newList.save();
  req.flash("success", "New Listing Added!");
  res.redirect("/listings");
};
module.exports.renderEdit = async (req, res) => {
  let { id } = req.params;
  const list = await Listing.findById(id);
  if (!list) {
    req.flash("error", "Listing Does Not Exist!");
    return res.redirect("/listings");
  }
  let originalImageUrl = (list.image && list.image.url) || "";
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
  res.render("listings/edit.ejs", { list, originalImageUrl });
};
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.list });
  if (!listing) {
    req.flash("error", "Listing Does Not Exist!");
    return res.redirect("/listings");
  }
  // keep the map pin in sync when the address changes
  if (listing.location !== req.body.list.location || listing.country !== req.body.list.country) {
    const geometry = await geocode(`${req.body.list.location}, ${req.body.list.country}`);
    if (geometry) await Listing.updateOne({ _id: id }, { geometry });
  }
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated!");

  res.redirect(`/listings/${id}`);
};
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id); // calls mongoose post m/w in .js
  req.flash("success", "Listing Successfully Deleted !");
  res.redirect("/listings");
};
