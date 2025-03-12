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

// Add product
exports.addProduct = async (req, res, next) => {
  console.log("product--->", req.body);
  try {
    if (!req.body.rate) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errorMessages: [{ path: "rate", message: "Path `rate` is required." }],
      });
    }

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
;
;

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
;

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
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Get related products
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const products = await productServices.getRelatedProductService(req.params.id);
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// Update product
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await productServices.updateProductService(req.params.id, req.body);
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