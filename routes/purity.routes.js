const express = require('express');
const router = express.Router();
// internal
const purityController = require('../controller/purity.controller.js');

// get
router.get('/get', purityController.getSinglePurity);
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
router.post('/delete', purityController.deletePurity);
// delete product
router.post('/edit', purityController.updatePurity);

module.exports = router;