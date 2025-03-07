const Product = require("../model/Products.js");
const Category = require("../model/Category.js");
const MetalType = require("../model/MetalType.js");
const Purity = require("../model/Purity.js");
const Review = require("../model/Review.js");

// Create product service
exports.createProductService = async (productData) => {
  try {
    // Validate required fields
    const requiredFields = [
      "about_this_item",
      "additional_info",
      "product_name",
      "category",
      "metal_type",
      "gender",
      "size",
      "weight",
      "jewellery_type",
      "making_charges_per_gm",
      "purity",
      "rate", // Ensure rate is required
      "product_images",
    ];

    for (const field of requiredFields) {
      if (!productData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Create the product
    const product = new Product(productData);
    await product.save(); // The price will be calculated and saved automatically by the pre-save middleware

    return product; // Return the saved product with the calculated price
  } catch (error) {
    throw error; // Throw the error to be handled by the caller
  }
};

// Get all products
exports.getAllProductsService = async () => {
  const products = await Product.find({})
    .populate("rate")
    .populate("reviews")
    .populate("category")
    .populate("metal_type")
    .populate("purity");

  // No need to calculate the price here since it's already stored in the database
  const productsWithPrices = products.map((product) => ({
    ...product.toObject(),
    price: product.price, // Use the stored price
    averageRating: product.averageRating,
  }));

  return productsWithPrices;
};

// Get product by ID
exports.getProductService = async (id) => {
  const product = await Product.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "userId", select: "name email imageURL" },
    })
    .populate("rate")
    .populate("category")
    .populate("metal_type")
    .populate("purity");

  if (!product) {
    throw new Error("Product not found");
  }

  return {
    ...product.toObject(),
    price: product.price, // Use the stored price
    averageRating: product.averageRating,
  };
};

// Get products by category
exports.getProductsByCategoryService = async (categoryId) => {
  const products = await Product.find({ category: categoryId })
    .populate("reviews")
    .populate("rate")
    .populate("category")
    .populate("metal_type")
    .populate("purity");

  const productsWithPrices = products.map((product) => ({
    ...product.toObject(),
    price: product.price, // Use the stored price
    averageRating: product.averageRating,
  }));

  return productsWithPrices;
};

// Get top-rated products
exports.getTopRatedProductService = async () => {
  const products = await Product.find({ averageRating: { $gt: 0 } })
    .sort({ averageRating: -1 })
    .populate("reviews")
    .populate("rate")
    .populate("category")
    .populate("metal_type")
    .populate("purity");

  const productsWithPrices = products.map((product) => ({
    ...product.toObject(),
    price: product.price, // Use the stored price
    averageRating: product.averageRating,
  }));

  return productsWithPrices;
};

// Get out-of-stock products
exports.getStockOutProducts = async () => {
  const products = await Product.find({ status: "Hide" })
    .sort({ createdAt: -1 })
    .populate("rate")
    .populate("category")
    .populate("metal_type")
    .populate("purity");

  const productsWithPrices = products.map((product) => ({
    ...product.toObject(),
    price: product.price, // Use the stored price
  }));

  return productsWithPrices;
};

// Update product
exports.updateProductService = async (id, updatedData) => {
  const product = await Product.findByIdAndUpdate(id, updatedData, {
    new: true,
  })
    .populate("rate")
    .populate("category")
    .populate("metal_type")
    .populate("purity");

  if (product) {
    await product.updateAverageRating(); // Recalculate rating if necessary
  }

  return {
    ...product.toObject(),
    price: product.price, // Use the stored price
    averageRating: product.averageRating,
  };
};

// Delete product
exports.deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};