const express = require('express');
const router = express.Router();
const categoryController = require('../controller/category.controller');
const upload = require('../config/multerConfig');

// Routes
router.get('/get/:id', categoryController.getSingleCategory);
router.post('/add', upload.single('category_image'), categoryController.addCategory); // Ensure this is correct
router.post('/add-all', categoryController.addAllCategory);
router.get('/all', categoryController.getAllCategory);
router.get('/show/:type', categoryController.getProductTypeCategory);
router.get('/show', categoryController.getShowCategory);
router.delete('/delete/:id', categoryController.deleteCategory);
router.put('/edit/:id', upload.single('category_image'), categoryController.updateCategory); // Add upload middleware for update

module.exports = router;