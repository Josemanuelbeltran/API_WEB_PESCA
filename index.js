const express = require('express');
const router = require('./router');
const cors = (require('cors'))
const arranque = require("./models/index")

const app = express();

var ismae = function (){console.log("conectado")}


app.use(express.json())
app.use(express.urlencoded({extended:true}))
// app.use(cors({
//     origin:'*',
//     methods:['POST','GET','PUT','DELETE'],
//     allowedHeaders:'*' //'authorization,Content-Type'
// }));
app.use("/",router)



arranque.startbd()


app.listen(3000, ismae)

