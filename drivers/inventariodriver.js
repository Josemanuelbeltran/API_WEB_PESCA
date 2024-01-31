
const { where,Op } = require("sequelize")
const User = require("../models/products");
const Product = require("../models/products");

var datos = [{
    id:2,
    marca:"Daiwa",
    altura:4.20
    
},
{
    id:3,
    marca:"cinetic",
    altura:4.20
    
},
{
    id:1,
    marca:"Decatlon",
    altura:4.19
    
}]


exports.list = async function(request,reponse){
    // Consultar la base de datos para obtener los datos
        const datos = await Product.findAll(); // Esto supone que tienes un método 'findAll' en tu modelo

        // Enviar la respuesta en formato JSON
        return reponse.status(200).json(datos);
}

exports.get = function(request,reponse){
    let iddatos = request.params.id 
    for (let index = 0; index < datos.length; index++) {
        if (datos[index].id == iddatos) {
            return reponse.status(200).json(
                datos[index]
            )        
        }
    } return reponse.status(200).json({
        estado:"elemento no encontrado"
    })
}

exports.add = function(request,reponse){ 
    let idmax = 0
    for (let index = 0; index < datos.length; index++) {
        if (datos[index].id > idmax) {
            idmax = datos[index].id
        }
    }
    idmax++
    let objeto = {"id": idmax,
                  "marca":request.body.marca,
                  "altura": request.body.altura }
    datos.push(objeto)
    return reponse.status(200).json(objeto);
}

exports.delete = function(request,reponse){
    let iddatos = request.params.id 
    for (let index = 0; index < datos.length; index++) {
        if (datos[index].id == iddatos) {
            datos.splice(index,1)      
            return reponse.status(200).json({
                "borrado":"correctamente"
            })
        }
    } return reponse.status(200).json({
        estado:"elemento no encontrado"
    })
}
exports.update = function(request,reponse){
    let iddatos = request.params.id 
    
    for (let index = 0; index < datos.length; index++) {
        if (datos[index].id == iddatos) {
            let updateo = {
                "id" : parseInt(iddatos),
                "marca" : request.body.marca,
                "altura" : request.body.altura
            }
            datos[index] = updateo;
            return reponse.status(200).json({
                "cambio" : "realizado"
            })
        }
    }
}