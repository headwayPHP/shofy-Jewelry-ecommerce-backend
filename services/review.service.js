const mongoose = require("mongoose");
const Order = require("../model/Order.js");
const Product = require("../model/Products.js");
const Review = require("../model/Review.js");
const User = require("../model/User.js");

// Add a review
exports.addReviewService = async ({ userId, productId, rating, comment }) => {
    // Check if the user has already left a review for this product
    // const existingReview = await Review.findOne({ userId, productId });

    // if (existingReview) {
    //     throw new Error("You have already left a review for this product.");
    // }

    // // Check if the user has purchased the product before reviewing
    // const checkPurchase = await Order.findOne({
    //     userId: new mongoose.Types.ObjectId(userId),
    //     "cart.productId": productId, // Ensure correct field reference
    // });

    // if (!checkPurchase) {
    //     throw new Error("You must purchase the product before leaving a review!");
    // }

    // Create and save the new review
    const review = await Review.create({ userId, productId, rating, comment });

    // Update the product's average rating and review count
    const reviews = await Review.find({ productId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
        $push: { reviews: review._id },
        $set: { averageRating: averageRating.toFixed(1) }, // Update average rating
    });

    return review;
};

// Get all reviews for a specific product
exports.getReviewsByProductService = async (productId) => {
    const reviews = await Review.find({ productId }).populate("userId", "firstName lastName profilePhoto");

    if (!reviews.length) {
        throw new Error("No reviews found for this product.");
    }

    return reviews;
};

// Update a review by review ID
exports.updateReviewService = async (reviewId, { rating, comment }) => {
    // Find the review by ID
    const review = await Review.findById(reviewId);
    if (!review) {
        throw new Error("Review not found.");
    }

    // Update the review fields
    if (rating !== undefined) {
        review.rating = rating;
    }
    if (comment !== undefined) {
        review.comment = comment;
    }

    // Save the updated review
    await review.save();

    // Recalculate the product's average rating
    const reviews = await Review.find({ productId: review.productId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Update the product's average rating
    await Product.findByIdAndUpdate(review.productId, {
        $set: { averageRating: averageRating.toFixed(1) },
    });

    return review;
};

// Delete a single review by review ID
exports.deleteReviewService = async (reviewId) => {
    const review = await Review.findById(reviewId);
    if (!review) {
        throw new Error("Review not found.");
    }

    // Remove the review from the product's reviews array
    await Product.findByIdAndUpdate(review.productId, { $pull: { reviews: reviewId } });

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    return { message: "Review deleted successfully." };
};