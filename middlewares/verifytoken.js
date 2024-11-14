
const jwt = require('jsonwebtoken');
const { response } = require("express");
const tokengenerator = require("jsonwebtoken");
const { head } = require("../router");
require('dotenv').config({path:'.env'})
const check = (err, decoded) => {
    if (err) {
        console.log(err)
        return false
    }
    return true;}

exports.checktoken =  async function(request,reponse,next){
     if(!tokengenerator.verify(request.headers.authorization,process.env.LG_SECRET,check)){
        
         return reponse.status(401).send('Acceso denegado, inicie sesion');
     }
     const decodedPayload = jwt.decode(request.headers.authorization);
     request.userid = decodedPayload.payload
    next();
}