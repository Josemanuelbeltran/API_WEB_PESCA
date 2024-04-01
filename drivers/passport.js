 
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');


passport.use(new GoogleStrategy({
    clientID: "247988735690-2lcs2g61nat6sotja8korq865o2en8ou.apps.googleusercontent.com",//process.env.CLIENTE_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/login"
  },
  function(accessToken, refreshToken, profile, done) {
    // Aquí puedes buscar o crear un usuario en tu base de datos usando el perfil de Google
    return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

module.exports = passport;
