const express = require('express');
const router = express.Router();
// internal
const metaltypeController = require('../controller/metaltype.controller');

// get
router.get('/get', metaltypeController.getSingleMetalType);
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
router.post('/delete', metaltypeController.deleteMetalType);
// delete product
router.post('/edit', metaltypeController.updateMetalType);

module.exports = router;