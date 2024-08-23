  const passport = require('passport');
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  const User = require('../models/UserSchema');

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.clientID,
        clientSecret: process.env.clientSecret,
        callbackURL: process.env.callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            return done(null, user, { message: 'Login successful' });
          } else {
            user = new User({
              googleId: profile.id,
              username: profile.displayName,
              email: profile.emails[0].value,
            });
            await user.save();
            return done(null, user, { message: 'Thank you for signing up' });
          }
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  });
