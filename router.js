const express = require('express');
const router = express.Router();
const testdriver = require('./drivers/testdriver')
const inventariodriver = require('./drivers/inventariodriver')
const logindriver = require('./drivers/logindriver');
const verifytoken = require('./middlewares/verifytoken');
const passport = require("passport");
const axios = require('axios');
const app = express()
const img = require('./config/img');


router.get("/test",testdriver.test)

router.get("/inventario",verifytoken.checktoken,inventariodriver.list)
router.post("/inventario/getbycat",inventariodriver.getbycat)
router.post("/inventario/getbycatuser",verifytoken.checktoken,inventariodriver.getByCatUser)

router.post("/inventario/add",verifytoken.checktoken,inventariodriver.add)
router.delete("/inventario/delete",verifytoken.checktoken,inventariodriver.delete)
router.put("/inventario/update/:id",verifytoken.checktoken,inventariodriver.update)
router.post("/inventario/register",logindriver.register)
router.post("/inventario/logear",logindriver.logear)
router.post("/inventario/add_user_article",verifytoken.checktoken,inventariodriver.add_user_article)
router.get("/inventario/getcount",verifytoken.checktoken,inventariodriver.getCount)
router.get("/inventario/getname",verifytoken.checktoken,inventariodriver.getname)
router.get("/inventario/getcategories",verifytoken.checktoken,inventariodriver.getCategories)
router.get("/inventario/dataje")
router.get("/api/fishing-events",inventariodriver.getnews)
router.put("/inventario/updatedatos",verifytoken.checktoken,logindriver.updatedatos)
// Ruta para subir una imagen de perfil
router.post('/upload/profile-image', verifytoken.checktoken, img.single('profileImage'), logindriver.subirimg);
router.get("/inventario/exportUserToCsv",verifytoken.checktoken,inventariodriver.exportUserToCsv)
router.get("/inventario/exportUserToPdf",verifytoken.checktoken,inventariodriver.exportUserToPdf)
router.get("/inventario/redirect",verifytoken.checktoken,(req,res)=>res.status(200).send())

//router.get("/auth/google", passport.authenticate('google', { scope: ['profile', 'email'] }));

// router.get("/auth/google",(req, res) => {
//     app.use(express.static('../CLIENTE_PESCA'));
//     console.log("estoy en el redirect")
//     res.redirect("/inicio.html");
//     console.log("ya he redirigido")
//   }
// );
router.get("/inventario/:id",verifytoken.checktoken,inventariodriver.get)

module.exports = router;