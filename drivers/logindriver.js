const { where,Op } = require("sequelize")
const User = require("../models/User")
const tokengenerator = require("jsonwebtoken")
const encript = require("bcrypt")
require('dotenv').config({path:'.env'})




exports.register =  async function(request,reponse){
    
    let name = request.body.name
    let password = request.body.password
    let email = request.body.email
    var regex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
    

    let check = await User.findOne({
        where:{[Op.or]:[{name:name},{email:email}]} 
    })
    if ((check) != null){return reponse.status(200).send("Este nombre de usuario ya existe ")}
    
    if (name.length > 6 && regex.test(email) && password.length > 6){
        const  hash  =  encript . hashSync ( password ,10) ;
        await User.create({name:name,password:hash,email:email})
        return reponse.status(200).send("creado con exito")
    }
    return reponse.status(200).send("mal creado")
}

function isPasswordMatch(pass1,pass2){
    return encript.compareSync(pass1,pass2)
}

exports.logear = async function(request,reponse){
    console.log(request.body)
    let name = request.body.name;debugger;
    let password = request.body.password
    let email = request.body.email
    let us;
    let use;
    let token;
    if (name == undefined && email == undefined){
        return reponse.status(401).send("nombre de usuario o contraseña incorrecta")
    }
    if (name == undefined){ 
        us = await User.findOne({where:{email:email}})
        if (!us){
            return reponse.status(401).send("nombre de usuario o contraseña incorrecta")
        }
        if(isPasswordMatch(password,us.password)){
            token = tokengenerator.sign({payload:us.id},process.env.LG_SECRET,{expiresIn:"4h"})
            return reponse.status(200).send(token)
        }
        return reponse.status(401).send("nombre de usuario o contraseña incorrecta")
    }
    if (email == undefined) {
        use = await User.findOne({where:{name:name}})
        if (!use){
            return reponse.status(401).send("nombre de usuario o contraseña incorrecta")
        }
        if(isPasswordMatch(password,use.password)){
            token = tokengenerator.sign({payload:use.id},process.env.LG_SECRET,{expiresIn:"4h"})
            return reponse.status(200).send(token)
        }
        return reponse.status(401).send("nombre de usuario o contraseña incorrecta")
    } 
}

