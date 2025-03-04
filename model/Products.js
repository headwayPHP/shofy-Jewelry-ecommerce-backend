const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    about_this_item: { type: String, required: true },
    additional_info: { type: String, required: true },
    product_name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    color: { type: mongoose.Schema.Types.ObjectId, ref: "Color", required: true },
    metal_type: { type: mongoose.Schema.Types.ObjectId, ref: "MetalType", required: true },
    gender: { type: String, required: true },
    size: { type: String, required: true },
    width: { type: Number, required: true }, // Width in mm
    height: { type: Number, required: true }, // Height in mm
    weight: { type: Number, required: true }, // Weight in grams
    jewellery_type: { type: String, required: true },
    making_charges_per_gm: { type: Number, required: true }, // Making charges per gram
    making_type: { type: String, enum: ["percentage", "flat"], default: "flat" }, // Making charge type
    design_code: { type: String },
    product_images: [{ type: String, required: true }],
    discount_type: { type: String, enum: ["none", "flat", "percentage"], default: "none" },
    discount: { type: Number, default: 0, min: 0 }, // Discount must be non-negative
    purity: { type: mongoose.Schema.Types.ObjectId, ref: "Purity", required: true }, // Metal purity
    rate: { type: mongoose.Schema.Types.ObjectId, ref: "Rate", required: true }, // Reference to rates table
    status: { type: String, enum: ["Show", "Hide"], default: "Show" },

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
  const Rate = mongoose.model("Rate");
  const rateData = await Rate.findById(this.rate);
  return rateData ? rateData.perGramPriceAsPerCarat : 0;
};

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
  if (this.making_type === "percentage") {
    return (materialCost * this.making_charges_per_gm) / 100;
  } else {
    return this.making_charges_per_gm * this.weight;
  }
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
 * **Method to calculate final price after tax**
 * Formula: finalPrice = materialCost + discountedMakingCharges + (3% of materialCost) + (5% of discountedMakingCharges)
 */
productSchema.methods.getFinalPrice = async function () {
  const materialCost = await this.getMaterialCost();
  const discountedMakingCharges = await this.getDiscountedMakingCharges();

  // Tax calculation
  const taxOnMaterial = materialCost * 0.03; // 3% tax on material cost
  const taxOnMakingCharges = discountedMakingCharges * 0.05; // 5% tax on making charges

  // Final price
  return materialCost + discountedMakingCharges + taxOnMaterial + taxOnMakingCharges;
};

/**
 * **Virtual field for final price after tax**
 */
productSchema.virtual("price").get(async function () {
  return await this.getFinalPrice();
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
