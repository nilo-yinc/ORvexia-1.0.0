const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user.models');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/v1/auth/github/callback"
    },
    async function(accessToken, refreshToken, profile, done) {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          // Check if email already exists
          const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : `${profile.username}@github.com`;
          let existingUser = await User.findOne({ email });

          if (existingUser) {
            // Merge account
            existingUser.githubId = profile.id;
            existingUser.githubUsername = profile.username;
            existingUser.avatar = profile.photos && profile.photos[0].value;
            existingUser.githubAccessToken = accessToken; // SAVE TOKEN
            await existingUser.save();
            return done(null, existingUser);
          } else {
            // Create new user
            user = await User.create({
              name: profile.displayName || profile.username,
              email: email,
              githubId: profile.id,
              githubUsername: profile.username,
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
              githubAccessToken: accessToken, // SAVE TOKEN
              // No password needed
            });
            return done(null, user);
          }
        } else {
          // Update existing token
          user.githubAccessToken = accessToken;
          await user.save();
          return done(null, user);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  ));
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/v1/auth/google/callback"
    },
    async function(accessToken, refreshToken, profile, done) {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
          let existingUser = await User.findOne({ email });

          if (existingUser) {
            existingUser.googleId = profile.id;
            existingUser.avatar = profile.photos && profile.photos[0].value;
            existingUser.googleAccessToken = accessToken; // SAVE TOKEN
            if (refreshToken) existingUser.googleRefreshToken = refreshToken;
            await existingUser.save();
            return done(null, existingUser);
          } else {
            user = await User.create({
              name: profile.displayName,
              email: email,
              googleId: profile.id,
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
              googleAccessToken: accessToken, // SAVE TOKEN
              googleRefreshToken: refreshToken || null,
            });
            return done(null, user);
          }
        } else {
          user.googleAccessToken = accessToken;
          if (refreshToken) user.googleRefreshToken = refreshToken;
          await user.save();
          return done(null, user);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  ));
}

module.exports = passport;
