

const { where,Op } = require("sequelize")
const User = require("../models/user")
const tokengenerator = require("jsonwebtoken")
const encript = require("bcrypt")




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

exports.logear = async function(request,reponse){
    let name = request.body.name
    let password = request.body.password
    let email = request.body.email
    let us;
    let use;
    let token;

    if (name == undefined){  
        us = await User.findOne({where:{email:email}})
        const isPasswordMatch = encript.compareSync(request.body.password,us.password);
        if(us =! null && isPasswordMatch){
            
            //raruno lo del payload
            token = tokengenerator.sign({payload:us.name},"elcaballodesantiago",{expiresIn:"4h"})
            console.log(token)
            return reponse.status(200).send("inicio de sesion correcto")
        }
        return reponse.status(200).send("name undefined")
    }
        
    if (email == undefined) {
        use = await User.findOne({where:{name:name}})
        if(use =! null && use.password== password){
            
            return reponse.status(200).send("inicio de sesion correcto")
        }
        return reponse.status(200).send("name undefined")
    } 
            
    else {
        return reponse.status(200).send("introduce valores")
    }
}

