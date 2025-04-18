const ApiError = require('../errors/api-error');
const Category = require('../model/Category');
const Products = require('../model/Products');


// create category service
// exports.createCategoryService = async (data) => {
//   const category = await Category.create(data);
//   return category;
// }
exports.createCategoryService = async (data) => {
  try {
    return await Category.create(data);
  } catch (error) {
    if (error.code === 11000) {  // MongoDB duplicate key error
      throw new Error("Category name must be unique");
    }
    throw error;
  }
};

// create all category service
exports.addAllCategoryService = async (data) => {
  await Category.deleteMany()
  const category = await Category.insertMany(data);
  return category;
}

// get all show category service
exports.getShowCategoryServices = async () => {
  const category = await Category.find({ status: 'Show' }).sort({ createdAt: -1 }).populate('products');
  return category;
}

// get all category 
exports.getAllCategoryServices = async () => {
  const category = await Category.find({})
    .sort({ createdAt: -1 })
  return category;
}
// Service method
// Service method
exports.getWebCategoryServices = async () => {
  const categories = await Category.aggregate([
    {
      $match: { status: 'Show' } // Only show categories with status 'Show'
    },
    {
      $lookup: {
        from: 'products',
        let: { categoryId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$category', '$$categoryId'] },
              status: 'Show' // Only include products with status 'Show'
            }
          },
          {
            $project: {
              _id: 1,
              product_name: 1,
              about_this_item: 1,
              product_images: 1,
              price: 1,
              discount: 1,
              discount_type: 1,
              status: 1,
              averageRating: 1,
              reviews: 1
            }
          }
        ],
        as: 'products'
      }
    },
    {
      $project: {
        _id: 1,
        img: '$category_image', // Map category_image to img
        parent: '$category_name', // Map category_name to parent
        children: [], // Empty array as your model doesn't have children
        productType: 'jewellery', // Hardcoded as your products are jewellery
        products: {
          $map: {
            input: '$products',
            as: 'product',
            in: {
              _id: '$$product._id',
              img: { $arrayElemAt: ['$$product.product_images', 0] }, // Take first image
              product_name: '$$product.product_name',
              price: '$$product.price',
              about_this_item: '$$product.about_this_item',
              discount: '$$product.discount',
              discount_type: '$$product.discount_type',
              status: '$$product.status',
              averageRating: '$$product.averageRating',
              reviews: '$$product.reviews'
            }
          }
        },
        status: 1,
        createdAt: 1,
        updatedAt: 1
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);

  return categories;
};

// get type of category service
// exports.getCategoryTypeService = async (param) => {
//   // 1. Find the category by name (case-insensitive)
//   const category = await Category.findOne({
//     category_name: { $regex: new RegExp(`^${param}$`, 'i') }
//   });

//   if (!category) {
//     throw new Error('Category not found');
//   }

//   // 2. Find all products that reference this category ID
//   const products = await Products.find({ category: category._id });

//   return {
//     category,
//     products
//   };
// }

exports.getCategoryTypeService = async (categoryName) => {
  // 1. Find the category by name (case-insensitive)
  const category = await Category.findOne({
    category_name: { $regex: new RegExp(`^${categoryName}$`, 'i') }
  });

  if (!category) {
    throw new Error("Category not found");
  }

  // 2. Find all products that reference this category ID
  const products = await Products.find({ category: category._id });

  return {
    category,
    products
  };
};


// get type of category service
exports.deleteCategoryService = async (id) => {
  const result = await Category.findByIdAndDelete(id);
  return result;
}
// TODO: add 3 default prices of gold/silver/platinum in dashboard API
// update category
exports.updateCategoryService = async (id, payload) => {
  const isExist = await Category.findOne({ _id: id })

  if (!isExist) {
    throw new ApiError(404, 'Category not found !')
  }

  const result = await Category.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  })
  return result
}

// get single category
exports.getSingleCategoryService = async (id) => {
  const result = await Category.findById(id);
  return result;
}