const express = require('express');
const { fileUpload } = require('../controller/upload.controller');
const uploader = require('../middleware/uploder');

const router = express.Router();

// routes
// router.post('/single',uploader.single('file'),fileUpload)

router.post('/single', uploader.single('file'), (req, res) => {
    console.log("Uploaded file:", req.file); // Debug log
    res.status(200).json(req.file);
});

module.exports = router;