const {
  addReviewService,
  getReviewsByProductService,
  deleteReviewService,
  getAllReviewsService,
  updateReviewService,
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
exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await getAllReviewsService();
    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
}

// Get all reviews for a specific product
exports.getReviewsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const reviews = await getReviewsByProductService(productId);
    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Update a review by review ID
exports.updateReview = async (req, res, next) => {
  try {
    const { reviewId, rating, comment } = req.body;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required.",
      });
    }

    const updatedReview = await updateReviewService(reviewId, { rating, comment });
    res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      review: updatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a single review by review ID
exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.body;

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