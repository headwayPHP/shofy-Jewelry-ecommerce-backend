const Product = require("../model/Products.js");
const Category = require("../model/Category.js");
const MetalType = require("../model/MetalType.js");
const Purity = require("../model/Purity.js");
const Review = require("../model/Review.js");
const Color = require("../model/Color.js");
const Rate = require("../model/Rate.js");
const mongoose = require("mongoose");
const path = require("path");

exports.createProductService = async (productData) => {
  try {
    // Validate required fields
    const requiredFields = [
      "about_this_item",
      "product_name",
      "category",
      "metal_type",
      "gender",
      // "width",
      // "height",
      "weight",
      // "making_charges_per_gm",
      "product_images",
    ];

    for (const field of requiredFields) {
      if (!productData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // If price wasn't provided, fetch the latest rate
    if (productData.price === undefined || productData.price === null) {
      const latestRate = await Rate.findOne({
        metal_type: productData.metal_type,
      }).populate('purity').sort({ date: -1 });
      productData.purity = latestRate.purity
      if (!latestRate) {
        throw new Error("No rate found for the given metal type");
      }
      productData.rate = latestRate._id;

      // For gold products, purity is mandatory
      if (latestRate.metal_type.metal_name.toLowerCase() === 'gold') {
        if (!latestRate.purity) {
          throw new Error("Gold rate must have associated purity");
        }
        productData.purity = latestRate.purity._id; // Set purity reference
      }
    }

    // Normalize product images paths
    if (productData.product_images && Array.isArray(productData.product_images)) {
      productData.product_images = productData.product_images.map(imgPath =>
        path.posix.normalize(imgPath.replace(/\\/g, "/"))
      );
    }

    // Create the product
    const product = new Product(productData);
    await product.save();

    return product;
  } catch (error) {
    throw error;
  }
};

// Create product service
// exports.createProductService = async (productData) => {
//   try {
//     // Validate required fields
//     const requiredFields = [
//       "about_this_item",
//       "additional_info",
//       "product_name",
//       "category",
//       "metal_type",
//       'color',
//       "gender",
//       "size",
//       "weight",
//       "jewellery_type",
//       "making_charges_per_gm",
//       "purity",
//       "rate", // Ensure rate is required
//       "product_images",
//     ];

//     for (const field of requiredFields) {
//       if (!productData[field]) {
//         throw new Error(`Missing required field: ${field}`);
//       }
//     }

//     // Create the product
//     const product = new Product(productData);
//     await product.save(); // The price will be calculated and saved automatically by the pre-save middleware

//     return product; // Return the saved product with the calculated price
//   } catch (error) {
//     throw error; // Throw the error to be handled by the caller
//   }
// };


exports.getAllProductsService = async () => {
  const products = await Product.find({})
    .sort({ createdAt: -1 })
    .populate("rate", "rate_value")
    .populate("reviews")
    .populate({
      path: "reviews",
      populate: {
        path: "userId", // Assuming 'user_id' is a reference to the Users collection
      },
    })
    .populate("promo_type")
    .populate("category", "category_name") // Select only category_name
    .populate("metal_type", "metal_name") // Select only metal_name
    .populate("purity", "purity_value") // Select only purity_value
    .exec();

  // .populate("color", "color_name") // Select only color_name
  // No need to calculate the price since it's already stored
  const productsWithPrices = products.map((product) => ({
    ...product.toObject(),
    price: product.price, // Use the stored price
    averageRating: product.averageRating,
  }));

  return productsWithPrices;
};
exports.getWebProductsService = async () => {
  const products = await Product.find({})
    .sort({ createdAt: -1 })
    .populate("rate", "rate_value")
    .populate("reviews")
    .populate({
      path: "reviews",
      populate: {
        path: "userId", // Assuming 'user_id' is a reference to the Users collection
      },
    })
    .populate("promo_type")
    .populate("category", "category_name") // Select only category_name
    .populate("metal_type", "metal_name") // Select only metal_name
    .populate("purity", "purity_value") // Select only purity_value
    .exec();

  const formattedProducts = products.map((product) => {
    const firstImage = product.product_images.length > 0 ? product.product_images[0] : null;

    // product_images: product.product_images,
    // product_images: product.product_images,
    return {
      _id: product._id,
      product_images: product.product_images.map(
        (img) => `${process.env.ADMIN_URL}${img}`
      ),
      category: product.category ? product.category.category_name : null,
      product_name: product.product_name,
      about_this_item: product.about_this_item,
      reviews: product.reviews,
      price: product.price,
      discount: product.discount,
      tags: [product.metal_type ? product.metal_type.metal_name : null, product.purity ? product.purity.purity_value : null].filter(Boolean),
      status: product.status,
    };
  });

  return formattedProducts;
};

// Get product by ID
exports.getProductService = async (id) => {
  const product = await Product.findById(id)
    .sort({ createdAt: -1 })
    .populate({
      path: "reviews",
      populate: { path: "userId", select: "name email imageURL" },
    })
    .populate("rate")
    .populate("reviews")
    .populate({
      path: "reviews",
      populate: {
        path: "userId", // Assuming 'user_id' is a reference to the Users collection
      },
    })
    .populate("promo_type")
    .populate("category")
    .populate("metal_type")
    .populate("purity")
    .exec();

  // .populate("color")
  if (!product) {
    throw new Error("Product not found");
  }

  return {
    ...product.toObject(),
    price: product.price, // Use the stored price
    averageRating: product.averageRating,
  };
};
exports.getWebProductService = async (id) => {
  const product = await Product.findById(id)
    .sort({ createdAt: -1 })
    .populate({
      path: "reviews",
      populate: { path: "userId", select: "name email" }, // Removed imageURL as it's not in the sample data
    })
    // .populate("brand") // Added brand population
    .populate("category") // Kept category population
    .populate("reviews")
    .populate({
      path: "reviews",
      populate: {
        path: "userId", // Assuming 'user_id' is a reference to the Users collection
      },
    })
    .populate("rate")
    .populate("promo_type")
    .populate("category") // Select only category_name
    .populate("metal_type") // Select only metal_name
    .populate("purity") // Select only purity_value
    .exec();

  if (!product) {
    throw new Error("Product not found");
  }

  // Calculate average rating from reviews
  let averageRating = 0;
  if (product.reviews && product.reviews.length > 0) {
    const totalRatings = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    averageRating = totalRatings / product.reviews.length;
  }

  return {
    ...product.toObject(),
    averageRating,
    // No need to explicitly include price as it's already in the product object
  };
};

exports.getRelatedProductService = async (productId) => {
  try {
    // 1. Find the product and ensure it exists with a category
    const product = await Product.findById(productId)
      .populate('category', '_id name')
      .lean();

    if (!product) {
      throw new Error('Product not found');
    }

    if (!product.category || !product.category._id) {
      throw new Error('Product has no valid category');
    }

    // 2. Find related products
    const relatedProducts = await Product.find({
      'category': product.category._id,
      _id: { $ne: productId }
    })
      // .populate('brand', 'name _id')
      .sort({ createdAt: -1 })
      .populate('category', 'name _id')
      .select('-__v -createdAt -updatedAt')
      .limit(4)
      .lean();

    return relatedProducts;
  } catch (error) {
    console.error('Error in getRelatedProductService:', error);
    throw error; // Re-throw for controller to handle
  }
};

// Get products by category
exports.getProductsByCategoryService = async (categoryId) => {
  const products = await Product.find({ category: categoryId })
    .sort({ createdAt: -1 })
    .populate("rate")
    .populate("reviews")
    .populate("promo_type")
    .populate("category")
    .populate("metal_type")
    .populate("purity")
    .exec();

  // .populate("color")
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
    .sort({ createdAt: -1 })
    .sort({ averageRating: -1 })
    .populate("rate")
    .populate("reviews")
    .populate("promo_type")
    .populate("category")
    .populate("metal_type")
    .populate("purity")
    .exec();
  // .populate("color")
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
    .populate("reviews")
    .populate("promo_type")
    .populate("category")
    .populate("metal_type")
    .populate("purity")
    .exec();
  // .populate("color")
  const productsWithPrices = products.map((product) => ({
    ...product.toObject(),
    price: product.price, // Use the stored price
  }));

  return productsWithPrices;
};


exports.updateProductService = async (id, updatedData, files) => {
  try {
    // Fetch existing product
    let product = await Product.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    // Handle product images (keep existing if none provided)
    let product_images = product.product_images || [];
    if (files && files.length > 0) {
      // Map uploaded files to their paths
      product_images = files.map((file) =>
        path.posix.normalize(file.path.replace(/^public[\\/]/, "").replace(/\\/g, "/"))
      );
    }

    // Update the product_images field in the updatedData
    updatedData.product_images = product_images;

    // Update product data
    product = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    })
      .sort({ createdAt: -1 })
      .populate("rate")
      .populate("reviews")
      .populate("category")
      .populate("metal_type")
      .populate("purity")
      .populate("promo_type")
      .exec();
    // .populate("color")

    // Ensure price calculation is updated (handled by pre-save middleware)
    await product.save();

    // Recalculate rating if necessary
    await product.updateAverageRating();

    return {
      ...product.toObject(),
      price: product.price,
      averageRating: product.averageRating,
    };
  } catch (error) {
    throw error; // Throw error to be handled by the caller
  }
};

// Delete product
exports.deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};



// Search products by searchText (case-insensitive)
exports.searchProductsService = async (searchText) => {
  try {
    if (!searchText || searchText.trim() === '') {
      return []; // Return empty array if no search term provided
    }

    // Create a case-insensitive regex for searching
    const searchRegex = new RegExp(searchText, 'i');

    const products = await Product.find({
      $or: [
        { product_name: { $regex: searchRegex } },
        { additional_info: { $regex: searchRegex } },
        { about_this_item: { $regex: searchRegex } }
      ]
    })
      .sort({ createdAt: -1 })
      .populate("rate", "rate_value")
      .populate("reviews")
      .populate({
        path: "reviews",
        populate: {
          path: "userId",
        },
      })
      .populate("promo_type")
      .populate("category", "category_name")
      .populate("metal_type", "metal_name")
      .populate("purity", "purity_value")
      .exec();

    return products.map((product) => ({
      ...product.toObject(),
      price: product.price,
      averageRating: product.averageRating,
      product_images: product.product_images.map(
        (img) => `${process.env.ADMIN_URL}${img}`
      ),
    }));
  } catch (error) {
    throw error;
  }
};

// Web version of search with simplified response
exports.searchWebProductsService = async (searchText) => {
  try {
    if (!searchText || searchText.trim() === '') {
      return []; // Return empty array if no search term provided
    }

    // Create a case-insensitive regex for searching
    const searchRegex = new RegExp(searchText, 'i');

    const products = await Product.find({
      $or: [
        { product_name: { $regex: searchRegex } },
        { additional_info: { $regex: searchRegex } },
        { about_this_item: { $regex: searchRegex } }
      ]
    })
      .sort({ createdAt: -1 })
      .populate("rate", "rate_value")
      .populate("reviews")
      .populate({
        path: "reviews",
        populate: {
          path: "userId",
        },
      })
      .populate("promo_type")
      .populate("category", "category_name")
      .populate("metal_type", "metal_name")
      .populate("purity", "purity_value")
      .exec();

    return products.map((product) => {
      const firstImage = product.product_images.length > 0 ? product.product_images[0] : null;

      return {
        _id: product._id,
        product_images: product.product_images.map(
          (img) => `${process.env.ADMIN_URL}${img}`
        ),
        category: product.category ? product.category.category_name : null,
        product_name: product.product_name,
        about_this_item: product.about_this_item,
        reviews: product.reviews,
        price: product.price,
        discount: product.discount,
        tags: [product.metal_type ? product.metal_type.metal_name : null, product.purity ? product.purity.purity_value : null].filter(Boolean),
        status: product.status,
      };
    });
  } catch (error) {
    throw error;
  }
};