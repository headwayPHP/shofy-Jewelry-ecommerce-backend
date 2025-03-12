const express = require("express");
const router = express.Router();
const {
    addReview,
    deleteReview,
    getReviewsByProduct,
    getAllReviews,
    updateReview, // Import the new updateReview controller
} = require("../controller/review.controller.js");

// Add a review
router.post("/add", addReview);
router.get("/all", getAllReviews);

// Get all reviews for a specific product
router.get("/product", getReviewsByProduct);

// Update a review by review ID
router.post("/update", updateReview);

// Delete a review (change from DELETE to POST to pass parameters in the request body)
router.post("/delete", deleteReview);

module.exports = router;