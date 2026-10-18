const User = require("../../models/users");

module.exports.userSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.userSignup = async (req, res) => {
  try {
    // we added a try catch block as we dont want to go to a different error page rather just flash error
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", `Welcome ${username}`);
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};
module.exports.userLoginForm = (req, res) => {
  res.render("users/login.ejs");
};
module.exports.userLogin = async (req, res) => {
  req.flash("success", "Welcome");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.userLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  });
  req.flash("success", "Logged-Out");
  res.redirect("/listings");
};
