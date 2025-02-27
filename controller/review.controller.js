const {
  addReviewService,
  getReviewsByProductService,
  deleteReviewService, // Updated function name
} = require("../services/review.service.js");

// Add a review
exports.addReview = async (req, res, next) => {
  try {
    const review = await addReviewService(req.body);
    res.status(201).json({
      success: true,
      message: "Review added successfully.",
      review,
    });
  } catch (error) {
    next(error);
  }
};

// Get all reviews for a specific product
exports.getReviewsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await getReviewsByProductService(productId);
    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a single review by review ID
exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.body; // Expecting reviewId in the request body

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required.",
      });
    }

    const result = await deleteReviewService(reviewId);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
