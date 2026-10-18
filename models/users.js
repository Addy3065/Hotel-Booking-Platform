const mongoose = require("mongoose");
const schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new schema({
  email: {
    type: String,
    required: true,
  },
});
// console.log(passportLocalMongoose);
userSchema.plugin(passportLocalMongoose); //passworc local mongoose adds a username and hashed password and salt field by itself

module.exports = mongoose.model("User", userSchema);
