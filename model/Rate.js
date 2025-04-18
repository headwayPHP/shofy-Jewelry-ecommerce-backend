const mongoose = require("mongoose");

const rateSchema = new mongoose.Schema({
    date: { type: Date, required: true, default: Date.now }, // Date of the rate
    metal_type: { type: mongoose.Schema.Types.ObjectId, ref: "MetalType", required: true }, // Reference to metal type
    purity: {
        type: mongoose.Schema.Types.ObjectId, ref: "Purity", required: function () {
            return this.metal_type.metal_name.toLowerCase() === 'gold';
        }
    }, // Reference to purity
    rate: { type: Number, required: true }, // Rate per gram
}, { timestamps: true });

/**
 * **Static Method to Update Rates and Recalculate Product Prices**
 * @param {Object} rates - Object containing gold_rate, silver_rate, platinum_rate
 */
rateSchema.statics.updateRatesAndProductPrices = async function (rates) {
    const { gold_rate, silver_rate, platinum_rate } = rates;

    // Update rates in the database for each metal type
    const metalTypes = await mongoose.model("MetalType").find();
    const updatedRates = [];

    for (const metalType of metalTypes) {
        let rateValue;

        switch (metalType.metal_name.toLowerCase()) {
            case "gold":
                rateValue = gold_rate;
                break;
            case "silver":
                rateValue = silver_rate;
                break;
            case "platinum":
                rateValue = platinum_rate;
                break;
            default:
                continue; // Skip unknown metal types
        }

        // Find or create a rate for the metal type and purity
        const rate = await this.findOneAndUpdate(
            { metal_type: metalType._id },
            { rate: rateValue },
            { upsert: true, new: true }
        );

        updatedRates.push(rate);
    }

    // Recalculate prices for all products
    const products = await mongoose.model("Product").find();
    for (const product of products) { // Debugging
        product.forcePriceCalculation = true;
        await product.save(); // This will trigger the pre-save middleware to recalculate the price
    }

    return updatedRates;
};

const Rate = mongoose.model("Rate", rateSchema);
module.exports = Rate;

