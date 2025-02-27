const express = require("express");
const rateController = require("../controller/rate.controller");
const { protect, adminOnly } = require("../middleware/authMiddleware.js");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Multer Storage Configuration for File Uploads
const storage = multer.diskStorage({
    destination: "public/rates",
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only JPEG, PNG, JPG, and PDF formats are allowed"));
        }
        cb(null, true);
    },
});

// ✅ CRUD Operations using Only POST Requests

// ➤ Create a new rate
router.post("/create", upload.single("rate_file"), protect, adminOnly, rateController.createRate);

// ➤ Get all rates
router.post("/list", rateController.getAllRates);

// ➤ Get a single rate by ID
router.post("/get", rateController.getRateById);

// ➤ Update a rate by ID
router.post("/update", upload.single("rate_file"), protect, adminOnly, rateController.updateRate);

// ➤ Delete a rate by ID
router.post("/delete", rateController.deleteRate);

module.exports = router;
