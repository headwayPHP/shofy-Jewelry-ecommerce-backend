const categoryServices = require("../services/category.service");
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads'); // Ensure this folder exists
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Save file with its original name
    }
});

const upload = multer({ storage: storage });

// Add category
exports.addCategory = async (req, res, next) => {
    try {
        console.log("Request Body:", req.body);
        console.log("Request File:", req.file);

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

        const fileName = req.file.filename; // Extract only the filename
        console.log("Extracted File Name:", fileName);

        const data = {
            category_name: req.body.category_name,
            category_image: fileName, // Store only the filename
        };
        data.category_image = 'images/' + data.category_image;

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
;
;

// Update category
exports.updateCategory = async (req, res, next) => {
    try {
        console.log("Request Body:", req.body);
        console.log("Request File:", req.file);

        const data = { ...req.body };

        // If a new file is uploaded, update category_image
        if (req.file) {
            const fileName = req.file.filename;
            data.category_image = 'images/' + fileName; // Store only the filename with 'images/' prefix
        } else if (req.body.category_image) {
            // Extract only the filename from the given full URL
            const imagePath = req.body.category_image.split('/').pop(); // Get last part after '/'
            data.category_image = 'images/' + imagePath;
        }

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
;

// exports.updateCategory = async (req, res, next) => {
//     try {
//         console.log("Request Body:", req.body);
//         console.log("Request File:", req.file);

//         // Fetch existing category to retain old image if none is provided
//         const existingCategory = await categoryServices.getSingleCategoryService(req.params.id);
//         if (!existingCategory) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Category not found",
//             });
//         }

//         // Determine if a new image is uploaded
//         let fileName = existingCategory.category_image; // Default to old image
//         if (req.file) {
//             fileName = 'images/' + req.file.filename; // Use new image if uploaded
//         }

//         const data = {
//             category_name: req.body.category_name || existingCategory.category_name,
//             category_image: fileName,
//         };

//         const result = await categoryServices.updateCategoryService(req.params.id, data);

//         res.status(200).json({
//             status: 'success',
//             message: 'Category updated successfully',
//             result,
//         });

//     } catch (error) {
//         next(error);
//     }
// };


// Add all categories
exports.addAllCategory = async (req, res, next) => {
    try {
        const result = await categoryServices.addAllCategoryService(req.body);
        res.json({
            message: 'Categories added successfully',
            result,
        });
    } catch (error) {
        next(error);
    }
};

// Get show categories
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

// Get all categories
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
// Controller method
// Controller method
exports.getWebCategory = async (req, res, next) => {
    try {
        const categories = await categoryServices.getWebCategoryServices();

        // Format image URLs with ADMIN_URL if needed
        const formattedCategories = categories.map(category => ({
            ...category,
            img: category.img ? `${process.env.ADMIN_URL}${category.img}` : null,
            products: category.products.map(product => ({
                ...product,
                img: product.img ? `${process.env.ADMIN_URL}${product.img}` : null
            }))
        }));

        res.status(200).json({
            success: true,
            result: formattedCategories
        });
    } catch (error) {
        next(error);
    }
};

// Get product type categories
// exports.getProductTypeCategory = async (req, res, next) => {
//     try {
//         const { category, products } = await categoryServices.getCategoryTypeService(req.params.type);

//         const formattedResponse = {
//             category: {
//                 ...category.toObject(),
//                 category_image: category.category_image
//                     ? `${process.env.ADMIN_URL}${category.category_image}`
//                     : null,
//             },
//             products: products.map(product => ({
//                 ...product.toObject(),
//                 // Add any product image formatting here if needed
//             }))
//         };

//         res.status(200).json({
//             success: true,
//             result: formattedResponse,
//         });
//     } catch (error) {
//         next(error);
//     }
// };

exports.getProductTypeCategory = async (req, res, next) => {
    try {
        const categoryName = req.query.category; // Extract category from query params

        if (!categoryName) {
            return res.status(400).json({
                success: false,
                message: "Category parameter is required",
            });
        }

        const { category, products } = await categoryServices.getCategoryTypeService(categoryName);

        const formattedResponse = {
            category: {
                ...category.toObject(),
                category_image: category.category_image
                    ? `${process.env.ADMIN_URL}${category.category_image}`
                    : null,
            },
            products: products.map(product => ({
                ...product.toObject(),
                product_images: product.product_images.map(image =>
                    `${process.env.ADMIN_URL}${image}` // Adding full URL
                ),
                // Add any product image formatting here if needed
            })),
        };

        res.status(200).json({
            success: true,
            result: formattedResponse,
        });
    } catch (error) {
        next(error);
    }
};


// Delete category
exports.deleteCategory = async (req, res, next) => {
    try {
        const result = await categoryServices.deleteCategoryService(req.params.id);
        res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        next(error);
    }
};

// Get single category
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