const rateService = require("../services/rate.service");

// Create a new rate
exports.createRate = async (req, res) => {
    try {
        const rate = await rateService.createRate(req.body, req.file);
        res.status(201).json({ success: true, message: "Rate created successfully", data: rate });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all rates
exports.getAllRates = async (req, res) => {
    try {
        const rates = await rateService.getAllRates();
        res.status(200).json({ success: true, data: rates });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get a single rate by ID
exports.getRateById = async (req, res) => {
    try {
        const { rateId } = req.body;
        const rate = await rateService.getRateById(rateId);
        res.status(200).json({ success: true, data: rate });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update a rate by ID
exports.updateRate = async (req, res) => {
    try {
        const { rateId } = req.body;
        const updatedRate = await rateService.updateRate(rateId, req.body, req.file);
        res.status(200).json({ success: true, message: "Rate updated successfully", data: updatedRate });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete a rate by ID
exports.deleteRate = async (req, res) => {
    try {
        const { rateId } = req.body;
        await rateService.deleteRate(rateId);
        res.status(200).json({ success: true, message: "Rate deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
