
const { where, Op } = require("sequelize")
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
const axios = require('axios');
const category = require("../models/Category");
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');


exports.list = async function (request, reponse) {
    // Consultar la base de datos para obtener los datos
    const datos = await Product.findAll();

    return reponse.status(200).json(datos);
}

exports.getbycat = async function (request, reponse) {
    let id_categorye = request.body.id_category
    const resultados = await Product.findAll({
        include: {
            model: Category, where: {
                id: id_categorye
            }
        }
    });

    return reponse.status(200).json(resultados)

}

exports.getCount = async function (request, response) {
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

async function getArticlesByCategoryAndUser(id_user, id_category) {
    try {
        // Consulta con logging para ayudar a depurar
        const articles = await Article.findAll({
            attributes: ['id', 'brand', 'model', 'price', 'year', 'type'],
            include: [
                {
                    model: User,
                    where: { id: id_user },
                    attributes: [] // No necesitas los atributos del usuario
                },
                {
                    model: Category,
                    where: { id: id_category },
                    attributes: ['name'] // Solo queremos el nombre de la categoría
                }
            ],
            logging: console.log // Esto imprimirá la consulta generada por Sequelize
        });

        console.log(`Artículos obtenidos para usuario ${id_user} y categoría ${id_category}:`, articles);
        return articles;
    } catch (error) {
        console.error("Error al obtener artículos por categoría y usuario:", error);
        return []; // Retorna un array vacío en caso de error para evitar que la función falle
    }
}


async function getArticleCountsByUser(id_user) {
    return await user_article.findAll({
        attributes: ['id_user', 'id_article', [sequelize.fn('COUNT', sequelize.col('*')), 'cantidad']],
        where: {
            id_user: id_user,
            id_article: {
                [sequelize.Op.in]: sequelize.literal(`(SELECT id FROM articles WHERE id <= (SELECT MAX(id) FROM articles))`)
            }
        },
        group: ['id_user', 'id_article']
    });
};

async function combineArticlesWithCount(articles, counts) {
    let article_w_count = [];
    for (let index = 0; index < articles.length; index++) {
        const a = articles[index];
        
        // Buscar el artículo correspondiente en `counts`
        const count_article = await counts.find(c => c.id_article == a.id);

        // Si `Category` es un objeto Sequelize, accede a sus `dataValues`
        const categoryName = a.Category ? a.Category.dataValues.name : 'Sin categoría';

        // Crear objeto con toda la información
        article_w_count.push({
            id: a.id,
            cantidad: count_article ? count_article.dataValues.cantidad : 0, // Si no se encuentra, la cantidad es 0
            brand: a.brand,
            model: a.model,
            price: a.price,
            category: categoryName,
            year: a.year,
            type: a.type
        });
    }
    return article_w_count;
};



async function getUserData(id_user) {

    // Utiliza una consulta parametrizada para prevenir inyecciones SQL
    const query = `
            SELECT SUM(a.price) AS total, u.name, u.email, u.photo , u.phone_number
            FROM articles a 
            JOIN user_articles ua ON a.id = ua.id_article 
            JOIN users u ON u.id = ua.id_user 
            WHERE ua.id_user = :id_user;
        `;
    const [result] = await cdatabase.query(query, {
        type: sequelize.QueryTypes.SELECT,
        replacements: { id_user: id_user }
    });
    return result
}


exports.getByCatUser = async function (request, response) {
    try {
        const id_category = request.body.id_category;
        const id_user = request.userid;

        // Obtener los artículos del usuario por categoría
        const articles = await getArticlesByCategoryAndUser(id_user, id_category);

        // Obtener la cantidad de artículos del usuario
        const counts = await getArticleCountsByUser(id_user);

        // Combinar los artículos con sus cantidades
        const article_w_count = await combineArticlesWithCount(articles, counts);

        return response.status(200).json(article_w_count);

    } catch (error) {
        console.error("Error al obtener los artículos:", error);
        return response.status(500).json({ message: "Error interno del servidor." });
    }
};

exports.getCategories = async function (request, response) {
    try {
        const categories = await category.findAll(); // Añadir paréntesis para ejecutar el método

        return response.status(200).json(categories);
    } catch (error) {
        console.error("Error al obtener las categorías:", error);
        return response.status(500).json({ error: "Error al obtener las categorías" });
    }
}


exports.get = async function (request, reponse) {
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

exports.add = async function (request, reponse) {
    try {

        // Crea un nuevo objeto con los datos proporcionados en la solicitud
        const nuevoObjeto = {
            id: null,
            brand: request.body.marca,
            model: request.body.modelo,
            year: request.body.anio,
            id_category: request.body.id_categoria,
            price: request.body.precio,
            type: request.body.type
        };

        console.log(nuevoObjeto);

        // Utiliza el método create de Sequelize para agregar el nuevo objeto a la base de datos
        const resultado = await Product.create(nuevoObjeto);


        // Devuelve el objeto recién creado en la respuesta
        return reponse.status(200).json(resultado);
    } catch (error) {
        console.error('Error al agregar nuevo dato:', error);
        return reponse.status(500).json({ message: 'Error interno del servidor' });
    }
}

exports.delete = async function (request, reponse) {
    try {
        const id_user = request.userid;
        const id_article = request.body.id_article
        // Utiliza el método destroy de Sequelize para eliminar el registro por ID
        const resultado = await user_article.destroy({
            where: {
                id_user: id_user,
                id_article: id_article

            }, limit: 1

        });
        console.log(id_article, id_user)
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

exports.update = async function (request, response) {
    try {
        const idDatos = request.params.id;
        let updatejson = {}

        if (request.body.marca) {
            updatejson.marca = request.body.marca

        }
        if (request.body.modelo) {
            updatejson.modelo = request.body.modelo

        }
        if (request.body.anio) {
            updatejson.anio = request.body.anio
        }
        if (request.body.id_categoria) {
            updatejson.id_categoria = request.body.id_categoria
        }
        if (request.body.precio) {
            updatejson.precio = request.body.precio
        }


        // Utiliza el método update de Sequelize para actualizar el registro por ID
        const resultado = await Product.update(updatejson, {
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

exports.add_user_article = async function (request, response) {
    try {
        const id_user = request.userid;
        const id_article = request.body.id_article

        const registro = {
            id_user: id_user,
            id_article: id_article
        }

        const result = await user_article.create(registro)

        return response.status(200).json(result);
    } catch (error) {
        console.error('Error al agregar nuevo dato:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
}

exports.getname = async function (request, response) {
    try {
        result = await getUserData(request.userid)
        if (!result) {
            return response.status(404).json({ message: "Usuario no encontrado." });
        }

        // Ruta de la imagen original
        return response.status(200).json(result);

    } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        return response.status(500).json({ message: "Error interno del servidor." });
    }
};



exports.getnews = async (req, res) => {
    const TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiJmaXNoaW52ZW50IiwidXNlcklkIjozODE3MCwiYXBwbGljYXRpb25OYW1lIjoiZmlzaGludmVudCIsImlkIjoxODQ2LCJ0eXBlIjoidXNlci1hcHBsaWNhdGlvbiJ9LCJpYXQiOjE3MjY4MjI1MDcsImV4cCI6MjA0MjE4MjUwNywiYXVkIjoiZ2Z3IiwiaXNzIjoiZ2Z3In0.PC_lvHGC8-VyZ1bUgFUrWwr21xqxg-DAHG0wVOhxPeHJVp2blz92OAjYSP0m2DdkY0rl7IMiBE6p04RtqXGd7L32r-0Xf5mBN08BfKtT86nG8bBilOHNfWbNi_6JE0QjoiQkw2Etuu950xI5dF38669ANckQzDPBpTC3thtvjAGWwR552RVlA44rlkrxotvJq_M6yAkdLOJ3ZZnmcnkwIYyIwXhh7283fMqylNuNWah9jpyU_wOpDS-N-6u0QLHaf7sE4HyJEzFkCFNXjoXQMEVKc7SBJwqmj2iOSvRkXGBAsTRQXshsJ3zj9anMJRKAzelhZghwTyGVR81EB-YthCPHAOBw8UudmXUkvuBHZFi3kCKId6aNsMuwCvaXnapGP7GsUxFUBKNUE2I_065hUPZ5BEBGNn77kZLQ45BbYMXIsSkXiu1dkGwwS5ycB5KcwhUuOHNXWWnyZrdk2sbW4CasQSkEodDWwTOcO3jrkVTo7sAS_6NRZiyZ2XEip6W4";

    try {
        const response = await axios.get('https://gateway.api.globalfishingwatch.org/v3/events', {
            params: {
                'vessels[0]': '9b3e9019d-d67f-005a-9593-b66b997559e5',
                'datasets[0]': 'public-global-fishing-events:latest',
                'start-date': '2017-03-01',
                'end-date': '2024-03-01',
                'limit': 10,
                'offset': 0
            },
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error al hacer la solicitud a la API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error al obtener los eventos de pesca' });
    }
};

exports.exportUserToCsv = async function (request, response) {
    try {
        // Obtener el ID del usuario
        const id_user = request.userid;

        // Obtener los datos del usuario
        let userData = await getUserData(id_user);

        if (!userData || Object.keys(userData).length === 0) {
            return response.status(404).json({ message: "Usuario no encontrado." });
        }

        let csvData = [];

        // Añadir la información del usuario al principio del CSV
        csvData.push({
            name: userData.name,
            email: userData.email,
            phone_number: userData.phone_number,
            photo: userData.photo,
            article_name: '',
            cantidad: ''
        });

        // Obtener los datos del inventario por categoría utilizando los métodos existentes
        for (let id_category = 1; id_category < 4; id_category++) {
            console.log(`Obteniendo artículos para la categoría ${id_category}...`);
            let articles = await getArticlesByCategoryAndUser(id_user, id_category);
            console.log(`Artículos obtenidos para la categoría ${id_category}:`, articles);

            if (!articles || articles.length === 0) {
                console.log(`No se encontraron artículos para la categoría ${id_category}.`);
                continue; // Si no hay artículos, pasar a la siguiente categoría
            }

            const counts = await getArticleCountsByUser(id_user);
            console.log(`Conteo de artículos para el usuario ${id_user}:`, counts);

            const article_w_count = await combineArticlesWithCount(articles, counts);
            console.log(`Artículos combinados con cantidad para la categoría ${id_category}:`, article_w_count);

            // Verificar si hay al menos un artículo con categoría
            if (article_w_count.length > 0) {
                // Acceder correctamente a la propiedad de la categoría
                const categoryName = article_w_count[0].Category && article_w_count[0].Category.dataValues
                    ? article_w_count[0].Category.dataValues.name
                    : `Categoría ${id_category}`;

                // Añadir una fila descriptiva para la categoría
                csvData.push({
                    name: '',
                    email: '',
                    phone_number: '',
                    photo: '',
                    article_name: `Categoría: ${categoryName}`,
                    cantidad: ''
                });

                // Añadir cada artículo bajo la categoría correspondiente
                article_w_count.forEach(article => {
                    csvData.push({
                        name: '',
                        email: '',
                        phone_number: '',
                        photo: '',
                        article_name: article.model,
                        cantidad: article.cantidad
                    });
                });
            } else {
                console.log(`No se encontraron artículos combinados para la categoría ${id_category}.`);
            }
        }

        // Generar CSV a partir de los resultados combinados
        const fields = ['name', 'email', 'phone_number', 'photo', 'article_name', 'cantidad'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(csvData);

        // Crear la carpeta si no existe
        const dirPath = path.join(__dirname, '../exports');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Ruta temporal para guardar el archivo CSV
        const filePath = path.join(dirPath, `user_${id_user}_data.csv`);

        // Guardar el archivo CSV temporalmente
        fs.writeFileSync(filePath, csv);

        // Enviar el archivo CSV como respuesta
        response.setHeader('Content-Disposition', `attachment; filename="user_${id_user}_data.csv"`);
        response.setHeader('Content-Type', 'text/csv');
        response.send(csv);

    } catch (error) {
        console.error("Error al exportar los datos a CSV:", error);
        response.status(500).json({ message: "Error interno del servidor." });
    }
};

exports.exportUserToPdf = async function (request, response) {
    try {
        // Obtener el ID del usuario
        const id_user = request.userid;

        // Obtener los datos del usuario
        let userData = await getUserData(id_user);

        if (!userData || Object.keys(userData).length === 0) {
            return response.status(404).json({ message: "Usuario no encontrado." });
        }

        // Crear un nuevo documento PDF
        const doc = new PDFDocument();
        const filePath = path.join(__dirname, `../exports/user_${id_user}_data.pdf`);

        // Configurar el archivo para escribir el PDF
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Información del usuario
        doc.fontSize(20).text('Información del Usuario', { underline: true });
        doc.moveDown();
        doc.fontSize(14).text(`Nombre: ${userData.name}`);
        doc.text(`Correo Electrónico: ${userData.email}`);
        doc.text(`Teléfono: ${userData.phone_number}`);
        doc.moveDown();

        // Obtener los datos del inventario por categoría utilizando los métodos existentes
        for (let id_category = 1; id_category < 4; id_category++) {
            console.log(`Obteniendo artículos para la categoría ${id_category}...`);
            let articles = await getArticlesByCategoryAndUser(id_user, id_category);
            console.log(`Artículos obtenidos para la categoría ${id_category}:`, articles);

            if (!articles || articles.length === 0) {
                console.log(`No se encontraron artículos para la categoría ${id_category}.`);
                continue; // Si no hay artículos, pasar a la siguiente categoría
            }

            const counts = await getArticleCountsByUser(id_user);
            console.log(`Conteo de artículos para el usuario ${id_user}:`, counts);

            const article_w_count = await combineArticlesWithCount(articles, counts);
            console.log(`Artículos combinados con cantidad para la categoría ${id_category}:`, article_w_count);

            if (article_w_count.length > 0) {
                // Acceder correctamente a la propiedad de la categoría
                const categoryName = article_w_count[0].Category && article_w_count[0].Category.dataValues
                    ? article_w_count[0].Category.dataValues.name
                    : `Categoría ${id_category}`;

                // Añadir una fila descriptiva para la categoría
                doc.moveDown();
                doc.fontSize(18).text(`Categoría: ${categoryName}`, { underline: true });

                // Añadir cada artículo bajo la categoría correspondiente
                article_w_count.forEach(article => {
                    doc.fontSize(12).text(`Modelo: ${article.model} | Cantidad: ${article.cantidad}`);
                });
            } else {
                console.log(`No se encontraron artículos combinados para la categoría ${id_category}.`);
            }
        }

        // Finalizar la creación del PDF
        doc.end();

        // Esperar a que el archivo PDF se guarde antes de enviarlo al cliente
        writeStream.on('finish', function () {
            // Enviar el archivo PDF como respuesta
            response.setHeader('Content-Disposition', `attachment; filename="user_${id_user}_data.pdf"`);
            response.setHeader('Content-Type', 'application/pdf');
            response.sendFile(filePath);
        });

    } catch (error) {
        console.error("Error al exportar los datos a PDF:", error);
        response.status(500).json({ message: "Error interno del servidor." });
    }
};







