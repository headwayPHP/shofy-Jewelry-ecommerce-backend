const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    about_this_item: { type: String, required: true },
    additional_info: { type: String, required: null },
    product_name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    metal_type: { type: mongoose.Schema.Types.ObjectId, ref: "MetalType", required: true },
    gender: { type: String, required: true },
    size: { type: String, required: null },
    width: { type: Number, required: false },
    height: { type: Number, required: false },
    weight: { type: Number, required: true },
    quantity: { type: Number, required: false },
    promo_type: { type: mongoose.Schema.Types.ObjectId, ref: "PromoType", required: false },
    jewellery_type: { type: String, required: null },
    making_charges_per_gm: { type: Number, required: false },
    hall_mark_charges: { type: Number, required: false },
    additional_charges: { type: Number, required: false },
    making_type: { type: String, enum: ["percentage", "flat"], default: "flat" },
    design_code: { type: String },
    product_images: [{ type: String, required: true }],
    discount_type: { type: String, enum: ["none", "flat", "percentage"], default: "none" },
    discount: { type: Number, default: 0, min: 0 }, // Discount must be non-negative
    purity: { type: mongoose.Schema.Types.ObjectId, ref: "Purity", required: null }, // Metal purity
    rate: { type: mongoose.Schema.Types.ObjectId, ref: "Rate", required: null }, // Reference to rates table
    status: { type: String, enum: ["Show", "Hide"], default: "Show" },
    price: { type: Number, default: 0 },
    price_is_fixed: { type: Boolean, default: true },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    averageRating: { type: Number, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// changes
/**
 * **Method to fetch base rate based on metal type**
 */
productSchema.methods.getBaseRate = async function () {
    await this.populate('metal_type purity');

    const Rate = mongoose.model("Rate");

    // Find the latest rate for this metal type
    const rateData = await Rate.findOne({ metal_type: this.metal_type._id })
        .sort({ createdAt: -1 });

    if (!rateData) {
        throw new Error(`No rate found for ${this.metal_type.metal_name}`);
    }

    return rateData.rate;
};

/**
 * **Method to calculate effective rate based on purity**
 */
productSchema.methods.getEffectiveRate = async function () {
    const baseRate = await this.getBaseRate();

    // For non-gold metals, return base rate as purity doesn't affect price
    if (this.metal_type.metal_name.toLowerCase() !== 'gold') {
        return baseRate;
    }

    // For gold, calculate based on purity
    if (!this.purity) {
        throw new Error("Purity is required for gold products");
    }

    await this.populate('purity');
    console.log("Purity:", this.purity.product_purity); // Debugging

    const purityFactor = parseFloat((this.purity.product_purity / 24).toFixed(2)); // Assuming 24k is standard
    // const purityFactor = baseRate * (this.purity.product_purity / 24); // Assuming 24k is standard
    return baseRate * purityFactor;
};

/*
productSchema.methods.getEffectiveRate = async function () {
    const baseRate = await this.getBaseRate();

    const metalName = this.metal_type.metal_name.toLowerCase();

    // For gold, calculate based on purity
    if (metalName.toLowerCase() === 'gold') {
        if (!this.purity) {
            throw new Error("Purity is required for gold products");
        }

        await this.populate('purity');
        const purityFactor = parseFloat((this.purity.product_purity / 24).toFixed(2)); // 24k standard
        return baseRate * purityFactor;
    }

    // For silver, use purity if provided (usually 999 or 925)
    if (metalName.toLowerCase() === 'silver') {
        if (!this.purity) return baseRate; // Assume base rate is for pure silver
        await this.populate('purity');
        const purityFactor = parseFloat((this.purity.product_purity / 1000).toFixed(3)); // Silver is out of 1000
        return baseRate * purityFactor;
    }

    // For platinum, usually 950 purity
    if (metalName.toLowerCase() === 'platinum') {
        if (!this.purity) return baseRate; // Assume base rate is for 950 purity
        await this.populate('purity');
        const purityFactor = parseFloat((this.purity.product_purity / 1000).toFixed(3)); // Platinum purity also out of 1000
        return baseRate * purityFactor;
    }

    // Fallback
    return baseRate;
};
*/

/**
 * **Method to calculate material cost**
 * Formula: materialCost = weight * effectiveRate
 */
productSchema.methods.getMaterialCost = async function () {
    const effectiveRate = await this.getEffectiveRate();
    console.log("Effective Rate:", effectiveRate); // Debugging
    return this.weight * effectiveRate;
};

/**
 * **Method to calculate making charges**
 */
productSchema.methods.getMakingCharges = async function () {
    if (!this.making_charges_per_gm) return 0;

    if (this.making_type === "percentage") {
        const materialCost = await this.getMaterialCost();
        return (materialCost * this.making_charges_per_gm) / 100;
    } else {
        // return this.making_charges_per_gm * this.weight;
        return this.making_charges_per_gm;
    }
};

/**
 * **Method to calculate discounted making charges**
 */
productSchema.methods.getDiscountedMakingCharges = async function () {
    const makingCharges = await this.getMakingCharges();
    let discountedMakingCharges = makingCharges;

    if (this.discount_type === "percentage") {
        const discountAmount = (makingCharges * this.discount) / 100;
        discountedMakingCharges = makingCharges - discountAmount;
    } else if (this.discount_type === "flat") {
        discountedMakingCharges = makingCharges - this.discount;
    }

    return Math.max(discountedMakingCharges, 0);
};

/**
 * **Method to calculate final price after tax**
 */
productSchema.methods.getFinalPrice = async function () {
    try {
        const materialCost = await this.getMaterialCost();
        const discountedMakingCharges = await this.getDiscountedMakingCharges();

        // Tax calculation
        const taxOnMaterial = materialCost * 0.03; // 3% tax on material cost
        const taxOnMakingCharges = discountedMakingCharges * 0.05; // 5% tax on making charges
        const hall_mark_charges = this.hall_mark_charges || 0;
        const additional_charges = this.additional_charges || 0;

        // Final price
        const finalPrice = materialCost + discountedMakingCharges + taxOnMaterial + taxOnMakingCharges;

        return finalPrice;
    } catch (error) {
        console.error("Error calculating final price:", error);
        return null;
    }
};

/**
 * **Middleware to calculate and save the price before saving the product**
 */
productSchema.pre("save", async function (next) {
    try {
        // Skip calculation if price was explicitly set
        if (!this.forcePriceCalculation && this.price !== undefined && this.price !== null && this.price !== 0) {
            return next();
        }

        // Calculate the final price
        const finalPrice = await this.getFinalPrice();
        if (!this.price_is_fixed) {
            this.price = finalPrice || 0;
        }


        next();
    } catch (error) {
        console.error("Error calculating price during save:", error);
        next(error);
    }
});

/**
 * **Middleware to calculate and save the price before updating the product**
 */
productSchema.pre("findOneAndUpdate", async function (next) {
    try {
        const update = this.getUpdate();
        const product = await this.model.findOne(this.getQuery());

        if (!product) {
            return next(new Error("Product not found"));
        }

        // Skip if price is being explicitly set
        if (update.price !== undefined && update.price !== null) {
            return next();
        }

        // Recalculate if relevant fields are modified
        const shouldRecalculate = (update.weight || update.metal_type || update.purity || update.making_charges_per_gm || update.making_type || update.discount_type || update.discount);

        if (shouldRecalculate) {
            const finalPrice = await product.getFinalPrice();
            this.setUpdate({ ...update, price: finalPrice || 0 });
        }

        next();
    } catch (error) {
        console.error("Error calculating price during update:", error);
        next(error);
    }
});

/**
 * **Method to calculate and update the average rating**
 */
productSchema.methods.updateAverageRating = async function () {
    const product = await mongoose.model("Product").findById(this._id).populate("reviews");

    if (!product.reviews || product.reviews.length === 0) {
        this.averageRating = 0;
    } else {
        const sumRating = product.reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
        this.averageRating = sumRating / product.reviews.length;
    }

    await this.save();
};

const Product = mongoose.model("Product", productSchema);
module.exports = Product;