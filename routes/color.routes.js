const express = require('express');
const router = express.Router();
// internal
const colorController = require('../controller/color.controller.js');
const { adminOnly } = require('../middleware/authMiddleware.js');

// get
router.get('/get/:id', colorController.getSingleColor);
// add
router.post('/add', colorController.addColor);
// add All Color
router.post('/add-all', colorController.addAllColor);
// get all Color
router.get('/all', colorController.getAllColor);
// get Product Type Color
router.get('/show/:type', colorController.getProductTypeColor);
// get Show Color
router.get('/show', colorController.getShowColor);
// delete color
router.delete('/delete/:id', colorController.deleteColor);
// delete product
router.put('/edit/:id', colorController.updateColor);

module.exports = router;