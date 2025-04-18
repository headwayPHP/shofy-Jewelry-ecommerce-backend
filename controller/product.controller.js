const Brand = require("../model/Brand");
const productServices = require("../services/product.service");
const Product = require("../model/Products");
const multer = require("multer");

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });


// const multer = require("multer");

// // Multer setup for handling file uploads with size limit
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // Ensure this directory exists
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// // Set a file size limit (e.g., 50MB)
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
// });

// module.exports = upload;


// Add product
exports.addProduct = async (req, res, next) => {
  console.log("product--->", req.body);
  try {
    const product_images = req.files
      ? req.files.map((file) =>
        file.path.replace(/^public[\\/]/, "").replace(/\\/g, "/")
      )
      : [];

    const result = await productServices.createProductService({
      ...req.body,
      product_images,
    });

    console.log("product-result", result);

    res.status(200).json({
      success: true,
      status: "success",
      message: "Product created successfully!",
      data: result,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Add all products
module.exports.addAllProducts = async (req, res, next) => {
  try {
    const result = await productServices.addAllProductService(req.body);
    res.json({
      message: "Products added successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};

// Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}/`; // Get base URL dynamically
    const result = await productServices.getAllProductsService();

    // Modify product_images to include the full URL
    const updatedResult = result.map((product) => ({
      ...product,
      product_images: product.product_images.map(
        (img) => `${baseUrl}${img}`
      ),
    }));

    res.status(200).json({
      success: true,
      data: updatedResult,
    });
  } catch (error) {
    next(error);
  }
};
exports.getAllProductsWeb = async (req, res, next) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}/`; // Get base URL dynamically
    const result = await productServices.getWebProductsService();

    // Modify the `img` field to include the full URL
    // const updatedResult = result.map((product) => ({
    //   ...product,
    //   product_images: product.product_images ? `${baseUrl}${product.product_images}` : null, // Add base URL to the image path
    // }));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get all products by type
module.exports.getProductsByType = async (req, res, next) => {
  try {
    const result = await productServices.getProductTypeService(req);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Get offer product controller
module.exports.getOfferTimerProducts = async (req, res, next) => {
  try {
    const result = await productServices.getOfferTimerProductService(req.query.type);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get popular product by type
module.exports.getPopularProductByType = async (req, res, next) => {
  try {
    const result = await productServices.getPopularProductServiceByType(req.params.type);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get top-rated products
module.exports.getTopRatedProducts = async (req, res, next) => {
  try {
    const result = await productServices.getTopRatedProductService();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get single product
exports.getSingleProduct = async (req, res, next) => {
  try {
    const product = await productServices.getProductService(req.params.id);

    if (!product) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }

    // Modify product_images to include the full URL
    product.product_images = product.product_images.map((img) => `${process.env.ADMIN_URL}${img}`);

    res.json(product);
  } catch (error) {
    next(error);
  }
};
exports.getSingleWebProduct = async (req, res, next) => {
  try {
    const product = await productServices.getWebProductService(req.params.id);

    if (!product) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }

    // Modify product_images to include the full URL
    product.product_images = product.product_images.map((img) => `${process.env.ADMIN_URL}${img}`);
    product.category.category_image = `${process.env.ADMIN_URL}${product.category.category_image}`;

    res.json(product);
  } catch (error) {
    next(error);
  }
};


exports.getRelatedProducts = async (req, res, next) => {
  try {
    const relatedProducts = await productServices.getRelatedProductService(req.params.id);

    if (!relatedProducts || relatedProducts.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No related products found'
      });
    }
    // console.log(relatedProducts[0].product_images);
    // console.log(relatedProducts[0].product_images);
    // relatedProducts[0].product_images = relatedProducts[0].product_images.map((img) => `${process.env.ADMIN_URL}${img}`);
    relatedProducts.forEach((relatedProduct) => {
      relatedProduct.product_images = relatedProduct.product_images.map((img) => `${process.env.ADMIN_URL}${img}`);
    })
    res.status(200).json({
      success: true,
      data: relatedProducts
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      errorMessages: [{
        path: '',
        message: error.message
      }]
    });
  }
};

// Update product
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await productServices.updateProductService(
      req.params.id, // Product ID
      req.body,     // Updated product data
      req.files     // Uploaded images
    );
    res.send({ data: product, message: "Product updated successfully!" });
  } catch (error) {
    next(error);
  }
};
// Get review products
exports.reviewProducts = async (req, res, next) => {
  try {
    const products = await productServices.getReviewsProducts();
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// Get out-of-stock products
exports.stockOutProducts = async (req, res, next) => {
  try {
    const products = await productServices.getStockOutProducts();
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    await productServices.deleteProduct(req.params.id);
    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


// Search products
exports.searchProducts = async (req, res, next) => {
  try {
    const { searchText } = req.query;

    if (!searchText) {
      return res.status(400).json({
        success: false,
        message: "Search searchText is required"
      });
    }

    const results = await productServices.searchProductsService(searchText);

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// Web version of search
exports.searchWebProducts = async (req, res, next) => {
  try {
    const { searchText } = req.query;

    if (!searchText) {
      return res.status(400).json({
        success: false,
        message: "Search searchText is required"
      });
    }

    const results = await productServices.searchWebProductsService(searchText);

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};