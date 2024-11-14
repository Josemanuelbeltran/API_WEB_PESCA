const express = require('express');
const router = require('./router');
const arranque = require("./models/index");
const passport = require ("passport");
const path = require('path');
//require("./middlewares/PassportGoogle.js");

const app = express();

var ismae = function (){console.log("conectado")}


app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(passport.initialize());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/assets/img_profile', express.static('assets/img_profile'));
//app.use("/",router)
app.use(
    "/",
    // passport.authenticate("auth-google", {
    //   scope: [
    //     "https://www.googleapis.com/auth/userinfo.profile",
    //     "https://www.googleapis.com/auth/userinfo.email",
    //   ],
    //   session: false,
    // }),
    router
  );



arranque.startbd()


app.listen(3000, ismae)

