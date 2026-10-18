// .env file is only used in development process and not in production phase

require("dotenv").config();

const dburl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/hotels";
const sessionSecret = process.env.SECRET || "devsecret";
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listings");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const expressError = require("./utils/expressError");
const joi = require("joi");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review");
const listingRouter = require("./src/routes/listing.js");
const reviewRouter = require("./src/routes/reviews.js");
const session = require("express-session");
const { MongoStore } = require("connect-mongo"); // connect-mongo v6 exports MongoStore as a named export
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/users.js");
const userRouter = require("./src/routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.engine("ejs", ejsMate);

async function main() {
  await mongoose.connect(dburl);
}
main()
  .then(() => {
    console.log("Mongo Connected");
  })
  .catch((err) => {
    console.log(err);
  });

// home page -> listed hotels
app.get("/", (req, res) => {
  res.redirect("/listings");
});
const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: sessionSecret,
  },
  touchAfter: 86400,
});
store.on("error", () => {
  console.log("error in mongo session");
});
const sessionOptions = {
  store,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // for cross scripting attack
  },
};

app.use(session(sessionOptions));

//PASSPORT----------------------------------------
app.use(passport.initialize()); //
app.use(passport.session()); // a web app needs the ability to identify users as they browse from page to page
// this series of requests and respose ,each associated with same user is knows as session
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); //to store user related info in a session
passport.deserializeUser(User.deserializeUser()); // to remove user related info from session

// Flashing a message on a CRUD operation
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  res.locals.searchLocation = req.query.location || "";
  next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "demo@gmail.com",
//     username: "demoUser", //passport-mongoose automatically adds username(unique) attribute to schema
//   });
//   let regUser = await User.register(fakeUser, "userPassword");
//   res.json(regUser);
// });

// error handling M/W
app.all("/*anything", (req, res, next) => {
  next(new expressError(404, "Page Not Found!"));
});

// ERROR HANDLING MIDDLE WARE
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  if (err.name === "CastError") {
    // malformed id in the url, e.g. /listings/123
    statusCode = 404;
    err.message = "Page Not Found!";
  }
  if (!err.message) err.message = message;
  res.status(statusCode).render("error.ejs", { err });
  // res.status(statusCode).send(message);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`app is listening at port ${port}`);
});
