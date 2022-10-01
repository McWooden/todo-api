const GoogleStrategy = require('passport-google-oauth20').Strategy
const passport = require('passport')

passport.use(new GoogleStrategy({
    clientID: '701484835392-moov4mk232l02t6mtklkat5ncpp67iek.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "https://x6todo.herokuapp.com/google/callback",
    scope: ['profile']
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile)
  }
))

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})
