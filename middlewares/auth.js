const passport = require("passport");
const User = require("../models/user");
const LocalStrategy = require("passport-local").Strategy;

passport.use(
  new LocalStrategy(async (email, passsword, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: "incorrect email" });
      const isPasswordMatch = await user.comparePassword(passsword);
      if (isPasswordMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: "incorrect password" });
      }
    } catch (err) {
      return done(err);
    }
  })
);

module.exports = passport;
