const Listing = require("../../models/listings");
const expressError = require("../../utils/expressError");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
// the mapbox client throws without a token, so only create it when one is configured
const geocodingClient = mapToken ? mbxGeocoding({ accessToken: mapToken }) : null;

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports.index = async (req, res) => {
  const location = (req.query.location || "").trim();
  let filter = {};
  if (location) {
    // search by location (city/area) or country, case-insensitive
    const regex = new RegExp(escapeRegex(location), "i");
    filter = { $or: [{ location: regex }, { country: regex }] };
  }
  const allListing = await Listing.find(filter);
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
  // console.log(list);
  res.render("listings/show.ejs", { list });
};

module.exports.createListing = async (req, res) => {
  if (!req.file) {
    throw new expressError(400, "Please upload an image of the property");
  }
  let response = geocodingClient
    ? await geocodingClient
        .forwardGeocode({
          query: `${req.body.list.location}, ${req.body.list.country}`,
          limit: 1,
        })
        .send()
    : null;
  const feature = response && response.body.features[0];
  if (!feature) {
    throw new expressError(400, "Could not find that location on the map");
  }

  let url = req.file.path;
  let filename = req.file.filename;
  let list = req.body.list;
  let newList = new Listing(list);
  newList.owner = req.user._id;
  newList.image = { url, filename };
  newList.geometry = feature.geometry;
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
