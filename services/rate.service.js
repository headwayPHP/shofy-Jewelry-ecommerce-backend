const Rate = require("../model/Rate");
const mongoose = require("mongoose");

// Create a new rate
exports.createRate = async (data, file) => {
    const { metal_type, purity, rate } = data;
    const rateFile = file ? file.path : null;

    const newRate = new Rate({
        metal_type,
        purity,
        rate,
        rate_file: rateFile,
        date: new Date(),
    });

    await newRate.save();
    return newRate;
};

// Get all rates
exports.getAllRates = async () => {
    return await Rate.find().sort({ createdAt: -1 });
};

// Get a single rate by ID
exports.getRateById = async (rateId) => {
    const rate = await Rate.findById(rateId);
    if (!rate) {
        throw new Error("Rate not found");
    }
    return rate;
};

// Update a rate by ID
exports.updateRate = async (rateId, data, file) => {
    const { metal_type, purity, rate } = data;
    const rateFile = file ? file.path : null;

    const updatedRate = await Rate.findByIdAndUpdate(
        rateId,
        { metal_type, purity, rate, ...(rateFile && { rate_file: rateFile }) },
        { new: true }
    );

    if (!updatedRate) {
        throw new Error("Rate not found");
    }

    return updatedRate;
};

// Delete a rate by ID
exports.deleteRate = async (rateId) => {
    const deletedRate = await Rate.findByIdAndDelete(rateId);
    if (!deletedRate) {
        throw new Error("Rate not found");
    }
    return deletedRate;
};

// Get latest rates for gold, silver, and platinum
exports.getLatestRates = async () => {
    const metalTypes = await mongoose.model("MetalType").find();
    const latestRates = {};

    for (const metalType of metalTypes) {
        const rate = await Rate.findOne({ metal_type: metalType._id }).sort({ date: -1 });
        if (rate) {
            latestRates[metalType.metal_name.toLowerCase()] = rate.rate;
        }
    }

    return latestRates;
};