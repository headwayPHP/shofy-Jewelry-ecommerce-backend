const Rate = require("../model/Rate");

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
    return await Rate.find();
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
