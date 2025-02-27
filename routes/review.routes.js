const express = require("express");
const router = express.Router();
const { addReview, deleteReview, getReviewsByProduct } = require("../controller/review.controller.js");

// Add a review
router.post("/add", addReview);

// Get all reviews for a specific product
router.get("/product/:productId", getReviewsByProduct);

// Delete a review (change from DELETE to POST to pass parameters in the request body)
router.post("/delete", deleteReview);

module.exports = router;
