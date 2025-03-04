const Product = require("../model/Products.js");
const Category = require("../model/Category.js");
const MetalType = require("../model/MetalType.js");
const Purity = require("../model/Purity.js");
const Review = require("../model/Review.js");

// Create product service
exports.createProductService = async (productData) => {
  try {
    // Parse JSON fields (if sent as a string)
    if (typeof productData.product_images === "string") {
      productData.product_images = JSON.parse(productData.product_images);
    }
    if (typeof productData.reviews === "string") {
      productData.reviews = JSON.parse(productData.reviews);
    }

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
      "rate",
      "product_images",
    ];

    for (const field of requiredFields) {
      if (!productData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const product = new Product(productData);
    await product.save();

    return product; // Return the saved product
  } catch (error) {
    throw error; // Throw the error to be handled by the caller
  }
};

// Get all products
exports.getAllProductsService = async () => {
  const products = await Product.find({}).populate("reviews");

  // Base URL for images (replace with your actual domain)
  const baseUrl = process.env.ADMIN_URL;

  // Calculate prices for all products
  const productsWithPrices = await Promise.all(
    products.map(async (product) => {
      const price = await product.getFinalPrice(); // Await the price calculation
      return {
        ...product.toObject(),
        product_images: product.product_images.map((image) => {
          if (image.startsWith("http")) {
            return image;
          }
          return `${baseUrl}${image}`;
        }),
        price, // Include the calculated price
        averageRating: product.averageRating,
      };
    })
  );

  return productsWithPrices;
};

// Get product by ID
exports.getProductService = async (id) => {
  const product = await Product.findById(id).populate({
    path: "reviews",
    populate: { path: "userId", select: "name email imageURL" },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const price = await product.getFinalPrice(); // Use getFinalPrice instead of getSellingProductPrice

  return {
    ...product.toObject(),
    price, // Include the calculated price
    averageRating: product.averageRating,
  };
};

// Get products by category
exports.getProductsByCategoryService = async (categoryId) => {
  const products = await Product.find({ category: categoryId }).populate("reviews");
  const productsWithPrices = await Promise.all(
    products.map(async (product) => {
      const price = await product.getFinalPrice();
      return {
        ...product.toObject(),
        price,
        averageRating: product.averageRating,
      };
    })
  );
  return productsWithPrices;
};

// Get top-rated products
exports.getTopRatedProductService = async () => {
  const products = await Product.find({ averageRating: { $gt: 0 } })
    .sort({ averageRating: -1 })
    .populate("reviews");
  const productsWithPrices = await Promise.all(
    products.map(async (product) => {
      const price = await product.getFinalPrice();
      return {
        ...product.toObject(),
        price,
        averageRating: product.averageRating,
      };
    })
  );
  return productsWithPrices;
};

// Get out-of-stock products
exports.getStockOutProducts = async () => {
  const products = await Product.find({ status: "Hide" }).sort({ createdAt: -1 });
  const productsWithPrices = await Promise.all(
    products.map(async (product) => {
      const price = await product.getFinalPrice();
      return {
        ...product.toObject(),
        price,
      };
    })
  );
  return productsWithPrices;
};

// Update product
exports.updateProductService = async (id, updatedData) => {
  const product = await Product.findByIdAndUpdate(id, updatedData, { new: true });
  if (product) {
    await product.updateAverageRating(); // Recalculate rating if necessary
  }
  const price = await product.getFinalPrice();
  return {
    ...product.toObject(),
    price,
    averageRating: product.averageRating,
  };
};

// Delete product
exports.deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};