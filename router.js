const express = require('express');
const router = express.Router();
const testdriver = require('./drivers/testdriver')
const inventariodriver = require('./drivers/inventariodriver')
const logindriver = require('./drivers/logindriver');
const verifytoken = require('./middlewares/verifytoken');


router.get("/test",testdriver.test)

router.get("/inventario",verifytoken.checktoken,inventariodriver.list)
router.get("/inventario/:id",verifytoken.checktoken,inventariodriver.get)
router.post("/inventario/add",verifytoken.checktoken,inventariodriver.add)
router.delete("/inventario/delete/:id",verifytoken.checktoken,inventariodriver.delete)
router.put("/inventario/update/:id",verifytoken.checktoken,inventariodriver.update)
router.post("/inventario/register",logindriver.register)
router.post("/inventario/logear",logindriver.logear)

module.exports = router;