const { response } = require("express");
const tokengenerator = require("jsonwebtoken")
const check = (err, decoded) => {
    if (err) {
        return false
    }
    return true;}

exports.checktoken =  async function(request,reponse,next){
    if(!tokengenerator.verify(request.headers.authorization,"elcaballodesantiago",check)){
        return reponse.status(401).send('Acceso denegado');
    }
    next();
}