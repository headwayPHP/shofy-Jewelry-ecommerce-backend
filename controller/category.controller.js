const categoryServices = require("../services/category.service");

const upload = require('../config/multerConfig'); // Import multer configuration

// Add category
exports.addCategory = async (req, res, next) => {
  try {
    // Check if required fields are present
    if (!req.body.category_name || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errorMessages: [
          { path: "category_name", message: "Path `category_name` is required." },
          { path: "category_image", message: "Path `category_image` is required." },
        ],
      });
    }

    const data = {
      category_name: req.body.category_name,
      category_image: `/images/${req.file.filename}`, // Store relative path
    };

    const result = await categoryServices.createCategoryService(data);
    res.status(201).json({
      status: "success",
      message: "Category created successfully!",
      data: result,
    });
  } catch (error) {
    console.log(error);

    if (error.code === 11000) {
      return res.status(400).json({
        status: "fail",
        message: "Category name must be unique",
      });
    }

    next(error);
  }
};

// Update category
exports.updateCategory = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      category_image: req.file ? `/images/${req.file.filename}` : req.body.category_image, // Handle image update
    };

    const result = await categoryServices.updateCategoryService(req.params.id, data);
    res.status(200).json({
      status: 'success',
      message: 'Category updated successfully',
      result,
    });
  } catch (error) {
    next(error);
  }
};

// Other controller methods remain the same...
// add all category
exports.addAllCategory = async (req, res, next) => {
  try {
    const result = await categoryServices.addAllCategoryService(req.body);
    res.json({
      message: 'Category added successfully',
      result,
    })
  } catch (error) {
    next(error)
  }
}

// add all category
exports.getShowCategory = async (req, res, next) => {
  try {
    const categories = await categoryServices.getShowCategoryServices();

    const formattedCategories = categories.map(category => ({
      ...category.toObject(),
      category_image: category.category_image
        ? `${process.env.ADMIN_URL}${category.category_image}`
        : null,
    }));

    res.status(200).json({
      success: true,
      data: formattedCategories,
    });
  } catch (error) {
    next(error);
  }
};

// add all category
exports.getAllCategory = async (req, res, next) => {
  try {
    const categories = await categoryServices.getAllCategoryServices();

    // Map through categories and prepend ADMIN_URL to category_image
    const formattedCategories = categories.map(category => ({
      ...category.toObject(), // Convert Mongoose document to plain object
      category_image: category.category_image
        ? `${process.env.ADMIN_URL}${category.category_image}`
        : null,
    }));

    res.status(200).json({
      success: true,
      result: formattedCategories,
    });
  } catch (error) {
    next(error);
  }
};


// add all category
exports.getProductTypeCategory = async (req, res, next) => {
  try {
    const categories = await categoryServices.getCategoryTypeService(req.params.type);

    const formattedCategories = categories.map(category => ({
      ...category.toObject(),
      category_image: category.category_image
        ? `${process.env.ADMIN_URL}${category.category_image}`
        : null,
    }));

    res.status(200).json({
      success: true,
      result: formattedCategories,
    });
  } catch (error) {
    next(error);
  }
};

// delete category
exports.deleteCategory = async (req, res, next) => {
  try {
    const result = await categoryServices.deleteCategoryService(req.params.id);
    res.status(200).json({
      success: true,
      result,
    })
  } catch (error) {
    next(error)
  }
}


// get single category
exports.getSingleCategory = async (req, res, next) => {
  try {
    const category = await categoryServices.getSingleCategoryService(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Prepend ADMIN_URL to category_image
    const formattedCategory = {
      ...category.toObject(),
      category_image: category.category_image
        ? `${process.env.ADMIN_URL}${category.category_image}`
        : null,
    };

    res.status(200).json({
      success: true,
      result: formattedCategory,
    });
  } catch (error) {
    next(error);
  }
};