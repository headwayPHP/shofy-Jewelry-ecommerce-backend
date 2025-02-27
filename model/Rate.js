const mongoose = require("mongoose");

const rateSchema = new mongoose.Schema({
    date: { type: Date, required: true, default: Date.now }, // Date of the rate
    metal_type: { type: mongoose.Schema.Types.ObjectId, ref: "MetalType", required: true }, // Reference to metal type
    purity: { type: mongoose.Schema.Types.ObjectId, ref: "Purity", required: true }, // Reference to purity
    rate: { type: Number, required: true }, // Rate per gram
}, { timestamps: true });

const Rate = mongoose.model("Rate", rateSchema);
module.exports = Rate;