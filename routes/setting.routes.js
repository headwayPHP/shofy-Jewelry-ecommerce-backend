const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware.js");
const settingController = require('../controller/setting.controller');
// const upload = require('../middlewares/upload')('settings', 'setting');
const multer = require("multer");
const path = require("path")

// Multer Storage Configuration
//TODO: Change the destination to your desired folder
const storage = multer.diskStorage({
    destination: "public/images",
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only JPEG, PNG, and JPG formats are allowed"));
        }
        cb(null, true);
    },
});

// For internal use (you only)
router.post('/create', upload.single('value'), settingController.createSetting);
router.delete('/:id', settingController.deleteSetting);

// For admin panel frontend
router.get('/', settingController.getAllSettings);
// router.put('/update-values', upload.single('value'),settingController.updateSettingsByIds);
router.put('/update-values', protect, upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'bank_logo', maxCount: 1 }
]), settingController.updateSettingsByNames);
module.exports = router;
