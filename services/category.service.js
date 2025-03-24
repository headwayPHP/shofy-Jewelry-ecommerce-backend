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

// get type of category service
exports.getCategoryTypeService = async (param) => {
  const categories = await Category.find({ productType: param }).populate('products');
  return categories;
}

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