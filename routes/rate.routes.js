const express = require("express");
const rateController = require("../controller/rate.controller");
const { protect, adminOnly } = require("../middleware/authMiddleware.js");

const router = express.Router();

// ✅ CRUD Operations using Only POST Requests

// ➤ Create a new rate
router.post("/create", rateController.createRate);

// ➤ Get all rates
router.post("/list", rateController.getAllRates);

// ➤ Get a single rate by ID
router.post("/get", rateController.getRateById);

// ➤ Update a rate by ID
router.post("/update", rateController.updateRate);

// ➤ Delete a rate by ID
router.post("/delete", rateController.deleteRate);

// ➤ Get latest rates for gold, silver, and platinum
router.get("/latest-rates", rateController.getLatestRates);

// ➤ Update rates and recalculate product prices
router.put("/update-rates", rateController.updateRatesAndProductPrices);

module.exports = router;