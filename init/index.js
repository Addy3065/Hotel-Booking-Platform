const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listings");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/hotels");
}
main()
  .then(() => {
    console.log("Mongo Connected");
  })
  .catch((err) => {
    console.log(err);
  });

const initDB = async () => {
  await Listing.deleteMany({});
  // reinitialize data to add owner attribute to data
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6a7f0ece0eb9c4c69bc33a7c",
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};
initDB();
