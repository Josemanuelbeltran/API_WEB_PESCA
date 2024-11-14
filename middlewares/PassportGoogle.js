const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const dotenv = require("dotenv");
const login = require("../drivers/logindriver");
const http = require('http');

dotenv.config(); // Carga las variables de entorno desde el archivo .env

const app = express();

// Obtén las credenciales desde las variables de entorno
const Clientid = process.env.GOOGLE_CLIENT_ID;
const Clientsecret = process.env.GOOGLE_CLIENT_SECRET;

// Configuración de Passport y GoogleStrategy
passport.use(
  "auth-google",
  new GoogleStrategy(
    {
      clientID: Clientid, // Utiliza las variables de entorno
      clientSecret: Clientsecret, // Utiliza las variables de entorno
      callbackURL: "http://localhost:3000/auth/google",
    },
    async function (accessToken, refreshToken, profile, done) {
      if (profile) {
        let GoogleAcc = {
          name: profile._json.name,
          email: profile._json.email,
          password: "",
          accessToken: accessToken
        };
        try {
          var token = await login.loginGoogle(GoogleAcc);
          console.log("Google me ha llamado con " + GoogleAcc.name + " " + GoogleAcc.email);
          console.log(token);
          done(null, GoogleAcc);
        } catch (error) {
          done(error);
        }
      }
    }
  )
);

// Inicialización de Passport y Middleware
app.use(passport.initialize());

// Ruta para iniciar sesión con Google
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Ruta de callback después de la autenticación de Google
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false
  }),
  (req, res) => {
    res.redirect("/inicio");
    res.send("¡Autenticación exitosa!");
  }
);

