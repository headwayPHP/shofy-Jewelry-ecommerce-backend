
const mongoose = require("mongoose");

// color: [{ type: mongoose.Schema.Types.ObjectId, ref: "Color", required: true }],
const productSchema = new mongoose.Schema(
    {
        about_this_item: { type: String, required: true },
        additional_info: { type: String, required: null },
        product_name: { type: String, required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        metal_type: { type: mongoose.Schema.Types.ObjectId, ref: "MetalType", required: true },
        gender: { type: String, required: true },
        size: { type: String, required: null },
        width: { type: Number, required: false }, // Width in mm
        height: { type: Number, required: false }, // Height in mm
        weight: { type: Number, required: true }, // Weight in grams
        quantity: { type: Number, required: false }, // Quantity of the product
        promo_type: { type: mongoose.Schema.Types.ObjectId, ref: "PromoType", required: false },
        jewellery_type: { type: String, required: null },
        making_charges_per_gm: { type: Number, required: false }, // Making charges per gram
        making_type: { type: String, enum: ["percentage", "flat"], default: "flat" }, // Making charge type
        design_code: { type: String },
        product_images: [{ type: String, required: true }],
        discount_type: { type: String, enum: ["none", "flat", "percentage"], default: "none" },
        discount: { type: Number, default: 0, min: 0 }, // Discount must be non-negative
        purity: { type: mongoose.Schema.Types.ObjectId, ref: "Purity", required: null }, // Metal purity
        rate: { type: mongoose.Schema.Types.ObjectId, ref: "Rate", required: null }, // Reference to rates table
        status: { type: String, enum: ["Show", "Hide"], default: "Show" },
        price: { type: Number, default: 0 }, // Add this field to store the calculated price
        // Reviews & Ratings
        reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
        averageRating: { type: Number, default: 0 },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

/**
 * **Method to fetch per gram price from rates table**
 */
productSchema.methods.getPerGramPrice = async function () {
    if (!this.rate) {
        console.error("Rate field is missing for product:", this._id);
        return 0;
    }

    const Rate = mongoose.model("Rate");
    const rateData = await Rate.findById(this.rate);

    if (!rateData) {
        console.error("Rate not found for ID:", this.rate);
        return 0;
    }

    console.log("Rate Data:", rateData); // Debugging
    return rateData.rate || 0;
};;

/**
 * **Method to calculate material cost**
 * Formula: materialCost = weight * perGramPriceAsPerCarat (from rates table)
 */
productSchema.methods.getMaterialCost = async function () {
    const perGramPrice = await this.getPerGramPrice();
    return this.weight * perGramPrice;
};

/**
 * **Method to calculate making charges**
 * If making_type is 'percentage', calculate as a percentage of material cost.
 * If making_type is 'flat', use the flat rate (making_charges_per_gm * weight).
 */
productSchema.methods.getMakingCharges = async function () {
    const materialCost = await this.getMaterialCost();
    // if (this.making_type === "percentage") {
    //   return (materialCost * this.making_charges_per_gm);
    // } else {
    //   return this.making_charges_per_gm * this.weight;
    // }
    return this.making_charges_per_gm * this.weight;
};

/**
 * **Method to calculate discounted making charges**
 * If discount_type is 'percentage', apply % discount on making charges.
 * If discount_type is 'flat', subtract directly from making charges.
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

    return Math.max(discountedMakingCharges, 0); // Ensure making charges don't go negative
};

/**
 * Gets the effective rate per gram based on metal type and purity
 */

/**
 * Calculates the effective rate considering purity for gold
 */
productSchema.methods.getEffectiveRate = async function () {
    await this.populate('rate metal_type purity');

    if (!this.rate) {
        throw new Error("Rate not set for product");
    }

    // For non-gold products, use rate as-is
    if (this.metal_type.metal_name.toLowerCase() !== 'gold') {
        return this.rate.rate;
    }

    // For gold, adjust based on purity
    if (!this.purity) {
        throw new Error("Purity not set for gold product");
    }

    const purityFactor = this.purity.product_purity / 24;
    return this.rate.rate * purityFactor;
};






/**
 * **Method to calculate final price after tax**
 * Formula: finalPrice = materialCost + discountedMakingCharges + (3% of materialCost) + (5% of discountedMakingCharges)
 */
productSchema.methods.getFinalPrice = async function () {
    try {
        const materialCost = await this.getMaterialCost();
        console.log("Material Cost:", materialCost); // Debugging

        const discountedMakingCharges = await this.getDiscountedMakingCharges();
        console.log("Discounted Making Charges:", discountedMakingCharges); // Debugging

        // Tax calculation
        const taxOnMaterial = materialCost * 0.03; // 3% tax on material cost
        const taxOnMakingCharges = discountedMakingCharges * 0.05; // 5% tax on making charges

        // Final price
        const finalPrice = materialCost + discountedMakingCharges + taxOnMaterial + taxOnMakingCharges;
        console.log("Final Price:", finalPrice); // Debugging

        return finalPrice;
    } catch (error) {
        console.error("Error calculating final price:", error);
        return null; // Return null if there's an error
    }
};

/**
 * **Middleware to calculate and save the price before saving the product**
 */
productSchema.pre("save", async function (next) {
    try {
        // Skip calculation if price was explicitly set (even if set to 0)
        if (this.price !== undefined && this.price !== null && this.price !== 0) {
            return next();
        }
        // Ensure we have the required rate
        if (!this.rate) {
            const Rate = mongoose.model("Rate");
            const latestRate = await Rate.findOne({
                metal_type: this.metal_type,
            }).sort({ date: -1 });

            if (!latestRate) {
                throw new Error("No rate found for the given metal type");
            }
            this.rate = latestRate._id;
        }

        // Calculate the final price
        const finalPrice = await this.getFinalPrice();
        this.price = finalPrice || 0;

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
        const shouldRecalculate = (
            update.weight ||
            update.rate ||
            update.making_charges_per_gm ||
            update.making_type ||
            update.discount_type ||
            update.discount
        );

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