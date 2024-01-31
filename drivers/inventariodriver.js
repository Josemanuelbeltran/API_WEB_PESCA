
const { where,Op } = require("sequelize")
const User = require("../models/products");
const Product = require("../models/products");



exports.list = async function(request,reponse){
    // Consultar la base de datos para obtener los datos
        const datos = await Product.findAll(); // Esto supone que tienes un método 'findAll' en tu modelo

        // Enviar la respuesta en formato JSON
        return reponse.status(200).json(datos);
}

exports.get = async function(request,reponse){
    const idDatos = request.params.id;

        // Utiliza el método findOne de Sequelize para buscar por ID
        const datoEncontrado = await Product.findOne({
            where: {
                id: idDatos
            }
        });

        if (datoEncontrado) {
            // Si se encuentra el dato, devolverlo en la respuesta
            return reponse.status(200).json(datoEncontrado);
        } else {
            // Si no se encuentra el dato, devolver un mensaje indicando que no se encontró
            return response.status(404).json({
                estado: "Elemento no encontrado"
            });
}
}

exports.add = async function(request,reponse){ 
    try {
        
        // Crea un nuevo objeto con los datos proporcionados en la solicitud
        const nuevoObjeto = {
            id: null,
            marca: request.body.marca,
            modelo: request.body.modelo,
            anio:request.body.anio,
            id_categoria:request.body.id_categoria,
            precio:request.body.precio
        };

        // Utiliza el método create de Sequelize para agregar el nuevo objeto a la base de datos
        const resultado = await Product.create(nuevoObjeto);

        // Devuelve el objeto recién creado en la respuesta
        return reponse.status(200).json(resultado);
    } catch (error) {
        console.error('Error al agregar nuevo dato:', error);
        return reponse.status(500).json({ message: 'Error interno del servidor' });
    }
}

exports.delete = async function(request,reponse){
    try {
        const idDatos = request.params.id;

        // Utiliza el método destroy de Sequelize para eliminar el registro por ID
        const resultado = await Product.destroy({
            where: {
                id: idDatos
            }
        });

        if (resultado > 0) {
            // Si se eliminó al menos un registro, significa que se borró correctamente
            return reponse.status(200).json({
                borrado: "correctamente"
            });
        } else {
            // Si no se encontró el registro, devuelve un mensaje indicando que el elemento no fue encontrado
            return reponse.status(404).json({
                estado: "Elemento no encontrado"
            });
        }
    } catch (error) {
        console.error('Error al borrar dato por ID:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
}
exports.update =async function(request,response){
    try {
        const idDatos = request.params.id;
        let updatejson = {}

        if(request.body.marca){
            updatejson.marca = request.body.marca
            
        }
        if(request.body.modelo){
            updatejson.modelo = request.body.modelo

        }
        if(request.body.anio){
            updatejson.anio = request.body.anio
        }
        if(request.body.id_categoria){
            updatejson.id_categoria = request.body.id_categoria
        }
        if(request.body.precio){
            updatejson.precio = request.body.precio
        }


        // Utiliza el método update de Sequelize para actualizar el registro por ID
        const resultado = await Product.update(updatejson,{
            where: {
                id: idDatos
            }
        });

        if (resultado[0] > 0) {
            // Si se actualizó al menos un registro, significa que se realizó el cambio
            return response.status(200).json({
                cambio: "realizado"
            });
        } else {
            // Si no se encontró el registro, devuelve un mensaje indicando que el elemento no fue encontrado
            return response.status(404).json({
                estado: "Elemento no encontrado"
            });
        }
    } catch (error) {
        console.error('Error al actualizar dato por ID:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
}