const ApiError = require('../errors/api-error');
const Color = require('../model/Color.js');
const Products = require('../model/Products');

exports.createColorService = async (data) => {
    try {
        return await Color.create(data);
    } catch (error) {
        if (error.code === 11000) {  // MongoDB duplicate key error
            throw new Error("Color name must be unique");
        }
        throw error;
    }
};

// create all color service
exports.addAllColorService = async (data) => {
    await Color.deleteMany()
    const color = await Color.insertMany(data);
    return color;
}

// get all show color service
exports.getShowColorServices = async () => {
    const color = await Color.find({ status: 'Show' }).populate('products');
    return color;
}

// get all color 
exports.getAllColorServices = async () => {
    const color = await Color.find({})
    return color;
}

// get type of color service
exports.getColorTypeService = async (param) => {
    const categories = await Color.find({ productType: param }).populate('products');
    return categories;
}

// get type of color service
exports.deleteColorService = async (id) => {
    const result = await Color.findByIdAndDelete(id);
    return result;
}

// update color
exports.updateColorService = async (id, payload) => {
    const isExist = await Color.findOne({ _id: id })

    if (!isExist) {
        throw new ApiError(404, 'Color not found !')
    }

    const result = await Color.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    })
    return result
}

// get single color
exports.getSingleColorService = async (id) => {
    const result = await Color.findById(id);
    return result;
}