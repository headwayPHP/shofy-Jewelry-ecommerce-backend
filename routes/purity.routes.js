const express = require('express');
const router = express.Router();
// internal
const purityController = require('../controller/purity.controller.js');

// get
router.get('/get/:id', purityController.getSinglePurity);
// add
router.post('/add', purityController.addPurity);
// add All Purity
router.post('/add-all', purityController.addAllPurity);
// get all Purity
router.get('/all', purityController.getAllPurity);
// get Product Type Purity
router.get('/show/:type', purityController.getProductTypePurity);
// get Show Purity
router.get('/show', purityController.getShowPurity);
// delete purity
router.delete('/delete/:id', purityController.deletePurity);
// delete product
router.put('/edit/:id', purityController.updatePurity);

module.exports = router;