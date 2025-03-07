const express = require('express');
const router = express.Router();
// internal
const promotypeController = require('../controller/promotype.controller.js');

// get
router.get('/get/:id', promotypeController.getSinglePromoType);
// add
router.post('/add', promotypeController.addPromoType);
// add All PromoType
router.post('/add-all', promotypeController.addAllPromoType);
// get all PromoType
router.get('/all', promotypeController.getAllPromoType);
// get Product Type PromoType
router.get('/show/:type', promotypeController.getProductTypePromoType);
// get Show PromoType
router.get('/show', promotypeController.getShowPromoType);
// delete promotype
router.delete('/delete/:id', promotypeController.deletePromoType);
// delete product
router.put('/edit/:id', promotypeController.updatePromoType);

module.exports = router;

// Product model.

/*
product_name
product_about
product_desc
category >
size ?
weight
metal_type >
gender
purity
jewellery_type
color >
promo_type >
making_charges_per_gram
design_code
discount  flat/percent
price ??

*/