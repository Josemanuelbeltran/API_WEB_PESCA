const { where, Op } = require("sequelize")
const User = require("../models/User")
const tokengenerator = require("jsonwebtoken")
const encript = require("bcrypt")
const passport = require("passport")
require('dotenv').config({ path: '.env' })




exports.register = async function (request, reponse) {

    let name = request.body.name
    let password = request.body.password
    let email = request.body.email
    var regex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;


    let check = await User.findOne({
        where: { [Op.or]: [{ name: name }, { email: email }] }
    })
    if ((check) != null) { return reponse.status(200).send("Este nombre de usuario ya existe ") }

    if (name.length > 6 && regex.test(email) && password.length > 6) {
        const hash = encript.hashSync(password, 10);
        await User.create({ name: name, password: hash, email: email })
        return reponse.status(200).send("creado con exito")
    }
    return reponse.status(200).send("mal creado")
}

function isPasswordMatch(pass1, pass2) {
    return encript.compareSync(pass1, pass2)
}

exports.logear = async function (request, reponse) {
    console.log(request)
    let name = request.body.name
    let password = request.body.password
    let email = request.body.email
    let us;
    let use;
    let token;
    if (name == undefined && email == undefined) {
        return reponse.status(401).send("nombre de usuario o contraseña incorrecta")
    }
    if (name == undefined) {
        us = await User.findOne({ where: { email: email } })
        if (!us) {
            return reponse.status(401).send("nombre de usuario o contraseña incorrecta")
        }
        if (isPasswordMatch(password, us.password)) {
            token = tokengenerator.sign({ payload: us.id }, process.env.LG_SECRET, { expiresIn: "4h" })
            return reponse.status(200).send(token)
        }
        return reponse.status(401).send("nombre de usuario o contraseña incorrecta")
    }
    if (email == undefined) {
        use = await User.findOne({ where: { name: name } })
        if (!use) {
            return reponse.status(401).send("nombre de usuario o contraseña incorrecta")
        }
        if (isPasswordMatch(password, use.password)) {
            token = tokengenerator.sign({ payload: use.id }, process.env.LG_SECRET, { expiresIn: "4h" })
            return reponse.status(200).send(token)
        }
        return reponse.status(401).send("nombre de usuario o contraseña incorrecta")
    }
}

exports.updatedatos = async function (request) {
    try {
        // Validar si el campo 'profileImage' está presente en la solicitud
        if (!request.body.profileImage) {
            return { status: 400, message: "No se ha proporcionado una foto para actualizar." };
        }

        // Realizar la actualización de la foto del usuario
        const [updatedRows] = await User.update({ photo: request.body.profileImage }, { where: { id: request.userid } });

        // Verificar si se actualizó al menos un registro
        if (updatedRows === 0) {
            return { status: 404, message: "Usuario no encontrado." };
        }

        // Devolver el resultado de la actualización
        return { status: 200, message: "Foto de perfil actualizada con éxito." };

    } catch (error) {
        console.error("Error al actualizar la foto de perfil:", error);
        return { status: 500, message: "Error interno del servidor." };
    }
};



exports.subirimg = async function (request, response) {
    try {
        // Verificar si se subió una imagen
        if (!request.file) {
            return response.status(400).send({ error: 'No se ha subido ninguna imagen' });
        }

        // Ruta de la imagen que se subió
        const profileImage = `${request.protocol}://${request.get('host')}/uploads/${request.file.filename}`;
        // Preparar el request.body con la URL de la imagen para actualizarla en la base de datos
        request.body.profileImage = profileImage;
        // Llamar a updatedatos para actualizar la foto de perfil del usuario
        const updateResult = await exports.updatedatos(request);

        // Enviar la respuesta al cliente basándose en el resultado de `updatedatos`
        return response.status(updateResult.status).send({ message: updateResult.message });

    } catch (error) {
        console.error("Error al subir la imagen:", error);
        return response.status(500).send({ error: 'Error al subir la imagen.' });
    }
};




// Configuración de multer para almacenar las imágenes en una carpeta llamada "uploads"



// exports.loginGoogle = async function (request,reponse){
//         console.log(request)
//         let name = request.name
//         let password = request.password
//         let email = request.email
//         let us;
//         let token

//             us = await User.findOne({where:{email:email}})
//             if (!us){
//                 User.create({name:name,password:password,email:email})
//                 token = tokengenerator.sign({payload:us.id},process.env.LG_SECRET,{expiresIn:"4h"})
//                 return token
//             }else{
//                 token = tokengenerator.sign({payload:us.id},process.env.LG_SECRET,{expiresIn:"4h"})
//                 return token
//             }
//         }




