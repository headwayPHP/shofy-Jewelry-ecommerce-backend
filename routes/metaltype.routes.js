const express = require('express');
const router = express.Router();
// internal
const metaltypeController = require('../controller/metaltype.controller');

// get
router.get('/get/:id', metaltypeController.getSingleMetalType);
// add
router.post('/add', metaltypeController.addMetalType);
// add All MetalType
router.post('/add-all', metaltypeController.addAllMetalType);
// get all MetalType
router.get('/all', metaltypeController.getAllMetalType);
// get Product Type MetalType
router.get('/show/:type', metaltypeController.getProductTypeMetalType);
// get Show MetalType
router.get('/show', metaltypeController.getShowMetalType);
// delete metaltype
router.delete('/delete/:id', metaltypeController.deleteMetalType);
// delete product
router.put('/edit/:id', metaltypeController.updateMetalType);

module.exports = router;