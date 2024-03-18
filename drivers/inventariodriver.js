
const { where,Op } = require("sequelize")
const sequelize = require("sequelize")
const User = require("../models/User");
const Product = require("../models/Article");
const Category = require("../models/Category");
const Article = require("../models/Article");
const user_article = require("../models/user_article");
const { response } = require("express");
const cdatabase = require("../config/database")
const sharp = require('sharp');
const Jimp = require('jimp')

exports.list = async function(request,reponse){
    // Consultar la base de datos para obtener los datos
        const datos = await Product.findAll(); 
        
        return reponse.status(200).json(datos);
}

exports.getbycat = async function(request,reponse){
    id_categorye= request.body.id_category
    const resultados = await Product.findAll({
        include:{model:Category,where:{
            id:id_categorye
        }
    }
    });

    return reponse.status(200).json(resultados)

}

exports.getCount = async function(request, response) {
    try {
        const id_user = request.userid;
        const results = await user_article.findAll({
        attributes: ['id_article', [sequelize.fn('COUNT', sequelize.col('*')), 'cantidad']],
        where: {
          id_user: id_user,
          id_article: {
            [sequelize.Op.in]: sequelize.literal(`(SELECT id FROM articles WHERE id <= (SELECT MAX(id) FROM articles))`)
          }
        },
        group: ['id_user', 'id_article']
      });
    response.status(200).json(results);
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: 'Internal server error' });
    }
  };

exports.getByCatUser = async function(request, response) {
    const id_category = request.body.id_category;
    const id_user = request.userid;
    
    const article = await Article.findAll({
        attributes: ['id', 'brand', 'model', 'price', 'year', 'type'],
        include: [
           {
                model: User,
                where: { id: id_user },attributes:[]
           },
           {
                model:Category,
                where: { id: id_category },
                attributes:['name']
           }
        ]
      })
        const count = await user_article.findAll({
        attributes: [ 'id_user','id_article', [sequelize.fn('COUNT', sequelize.col('*')), 'cantidad']],
        where: {
          id_user: id_user,
          id_article: {
            [sequelize.Op.in]: sequelize.literal(`(SELECT id FROM articles WHERE id <= (SELECT MAX(id) FROM articles))`)
          }
        },
        group: ['id_user', 'id_article']
      });
      var article_w_count = []
      for (let index = 0; index < article.length; index++) {
        var a = article[index]
        const count_article = count.find(c => c.id_article == a.id)
        console.log(a.id)
        //console.log(JSON.stringify(count_article))
        article_w_count.push({
            id:a.id,
            cantidad:count_article.dataValues.cantidad,
            brand:a.brand,
            model:a.model,
            price:a.price,
            category:a.Category,
            year:a.year,
            type:a.type
        })
      }
      return response.status(200).json(article_w_count)
      
}

exports.get = async function(request,reponse){
    const idDatos = request.params.id;

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
            return reponse.status(404).json({
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
        const id_user = request.userid;
        const id_article = request.body.id_article
        // Utiliza el método destroy de Sequelize para eliminar el registro por ID
        const resultado = await user_article.destroy({
            where: {
                id_user : id_user,
                id_article: id_article
                
            },limit:1
            
        });
        console.log(id_article,id_user)
        console.log(resultado)

    
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

exports.add_user_article = async function(request,response){
    try {
        const id_user = request.userid;
        const id_article = request.body.id_article

        const registro = {
            id_user : id_user,
            id_article:id_article
        }

        const result = await user_article.create(registro)
        
        return response.status(200).json(result);
    } catch (error) {
        console.error('Error al agregar nuevo dato:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
}

exports.getname = async function(request,response){
    const id_user = request.userid;
    const query = "SELECT SUM(a.price) AS total, u.name , u.email , u.photo FROM articles a JOIN user_articles ua ON a.id = ua.id_article JOIN users u ON u.id = ua.id_user WHERE ua.id_user = "+id_user+";"
    const [result] = await cdatabase.query(query, { type: sequelize.QueryTypes.SELECT });    
    //Ruta de la imagen original
        const imagePath = '../API_PESCA/assets/img_profile/'+result.photo+'.webp';

        console.log(result.photo)

        // Ruta donde guardar la imagen redimensionada
        const resizedImagePath = '../API_PESCA/assets/img_profile/'+result.photo+'_resized.JPG';
        console.log(resizedImagePath)
        // Tamaño deseado para la imagen redimensionada
        const width = 50; // Ancho en píxeles
        const height = 50;

        

        // Ruta donde guardar la imagen convertida a JPG
        const imagePathJPG = '../API_PESCA/assets/img_profile/'+result.photo+'.jpg';

        // Convertir la imagen de WebP a JPG
        sharp(imagePath)
            .jpeg() // Especificar el formato de salida como JPG
            .toFile(imagePathJPG, (err, info) => {
                if (err) {
                } else {
                    console.log('Imagen convertida con éxito:', info);
                }
            });
         const image = await Jimp.read(imagePathJPG);
         await image.resize(width, Jimp.AUTO).quality(50).writeAsync(resizedImagePath);   
        return response.status(200).json(result);

}





