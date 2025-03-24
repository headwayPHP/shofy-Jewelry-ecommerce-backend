const express = require('express');
const router = express.Router();
// internal
const metaltypeController = require('../controller/metaltype.controller');

const { protect, adminOnly } = require("../middleware/authMiddleware.js");

// get
router.get('/get/:id', metaltypeController.getSingleMetalType);
// add
router.post('/add', metaltypeController.addMetalType);
// add All MetalType
router.post('/add-all', metaltypeController.addAllMetalType);
// get all MetalType
//TODO: add adminOnly middleware in all relevant routes
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