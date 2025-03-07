const express = require('express');
const router = express.Router();
// internal
const contactusController = require('../controller/contactus.controller.js');

// get
router.get('/get/:id', contactusController.getSingleContactus);
// add
router.post('/add', contactusController.addContactus);
// add All Contactus
router.post('/add-all', contactusController.addAllContactus);
// get all Contactus
router.get('/all', contactusController.getAllContactus);
// get Product Type Contactus
router.get('/show/:type', contactusController.getProductTypeContactus);
// get Show Contactus
router.get('/show', contactusController.getShowContactus);
// delete contactus
router.post('/delete', contactusController.deleteContactus);
// delete product
router.put('/edit/:id', contactusController.updateContactus);

module.exports = router;