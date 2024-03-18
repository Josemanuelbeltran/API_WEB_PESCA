const express = require('express');
const router = express.Router();
const testdriver = require('./drivers/testdriver')
const inventariodriver = require('./drivers/inventariodriver')
const logindriver = require('./drivers/logindriver');
const verifytoken = require('./middlewares/verifytoken');


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
router.get("/inventario/getcount",inventariodriver.getCount)
router.get("/inventario/getname",verifytoken.checktoken,inventariodriver.getname)
router.get("/inventario/redirect",verifytoken.checktoken,(req,res)=>res.status(200).send())

router.get("/inventario/:id",verifytoken.checktoken,inventariodriver.get)

module.exports = router;