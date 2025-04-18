const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware.js");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Internal
const productController = require("../controller/product.controller.js");

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: "public/images",
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only JPEG, PNG, and JPG formats are allowed"));
        }
        cb(null, true);
    },
});
const categoryController = require('../controller/category.controller');

// Call the categoryController function when querying by category
router.get('/', categoryController.getProductTypeCategory);

// 🔹 Product Fetching Routes
router.get("/all", productController.getAllProducts);

// Add these to your product routes
router.get('/search', productController.searchProducts);
router.get('/web/search', productController.searchWebProducts);


router.get("/web", productController.getAllProductsWeb);
router.get("/offer", productController.getOfferTimerProducts);
router.get("/top-rated", productController.getTopRatedProducts);
router.get("/review-product/:productId", productController.reviewProducts);
router.get("/popular", productController.getPopularProductByType);
// router.get("/related-product", productController.getRelatedProducts);
router.get("/related-product/:id", productController.getRelatedProducts);
router.get("/show/:id", productController.getSingleProduct);
router.get("/web/:id", productController.getSingleWebProduct);
router.get("/stock-out", productController.stockOutProducts);
// router.get("/", productController.getProductsByType);

// 🔹 Product Modification Routes
router.post("/add", protect, adminOnly, upload.array("product_images", 5), productController.addProduct);
router.post("/add-all", protect, adminOnly, productController.addAllProducts);
router.put("/edit/:id", upload.array("product_images", 5), productController.updateProduct);
router.delete("/delete/:id", protect, adminOnly, productController.deleteProduct); // Use route parameter instead of body

module.exports = router;
