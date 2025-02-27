const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    about_this_item: { type: String, required: true },
    additional_info: { type: String, required: true },
    product_name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    metal_type: { type: mongoose.Schema.Types.ObjectId, ref: 'MetalType', required: true },
    gender: { type: String, required: true },
    size: { type: String, required: true },
    weight: { type: Number, required: true }, // Weight in grams
    jewellery_type: { type: String, required: true },
    making_charges_per_gm: { type: Number, required: true }, // Making charges per gram
    design_code: { type: String },
    product_images: [{ type: String, required: true }],
    discount_type: { type: String, enum: ['none', 'flat', 'percentage'], default: 'none' },
    discount: { type: Number, default: 0, min: 0 }, // Discount must be non-negative
    purity: { type: mongoose.Schema.Types.ObjectId, ref: "Purity", required: true }, // Metal purity
    perGramPriceAsPerCarat: { type: Number, required: true },// Price per gram based on carat
    status: { type: String, enum: ["Show", "Hide"], default: "Show" },
}, { timestamps: true });

/**
 * **Method to calculate original product price (before discount)**
 * Formula: price = weight * perGramPriceAsPerCarat + total_making_charges
 */
productSchema.methods.getOriginalProductPrice = function () {
    const materialCost = this.weight * this.perGramPriceAsPerCarat;
    const totalMakingCharge = this.weight * this.making_charges_per_gm;
    return materialCost + totalMakingCharge;
};

/**
 * **Method to calculate selling product price (after discount)**
 * If discount_type is 'percentage', apply % discount on making charge.
 * If discount_type is 'flat', subtract directly from making charge.
 */
productSchema.methods.getSellingProductPrice = function () {
    const materialCost = this.weight * this.perGramPriceAsPerCarat;

    let discountedMakingCharge;
    if (this.discount_type === 'percentage' || this.discount_type === '%') {
        const discountAmount = (this.makingCharge * this.discount) / 100;
        discountedMakingCharge = this.makingCharge - discountAmount;
    } else {
        discountedMakingCharge = this.makingCharge - this.discount;
    }

    return materialCost + discountedMakingCharge;
};


const Product = mongoose.model('Product', productSchema);
module.exports = Product;
