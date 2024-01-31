const express = require('express');
const router = require('./router');
const datadb = require('./config/database')

const app = express();

var ismae = function (){console.log("hola gafillas")}


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/",router)

datadb.authenticate();


app.listen(3000, ismae)

