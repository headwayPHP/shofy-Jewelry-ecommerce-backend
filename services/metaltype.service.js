const ApiError = require('../errors/api-error');
const MetalType = require('../model/MetalType');
const Products = require('../model/Products');

// create metaltype service
exports.createMetalTypeService = async (data) => {
    const metaltype = await MetalType.create(data);
    return metaltype;
}

// create all metaltype service
exports.addAllMetalTypeService = async (data) => {
    await MetalType.deleteMany()
    const metaltype = await MetalType.insertMany(data);
    return metaltype;
}

// get all show metaltype service
exports.getShowMetalTypeServices = async () => {
    const metaltype = await MetalType.find({ status: 'Show' }).populate('products');
    return metaltype;
}

// get all metaltype 
exports.getAllMetalTypeServices = async () => {
    const metaltype = await MetalType.find({})
    return metaltype;
}

// get type of metaltype service
exports.getMetalTypeTypeService = async (param) => {
    const categories = await MetalType.find({ productType: param }).populate('products');
    return categories;
}

// get type of metaltype service
exports.deleteMetalTypeService = async (id) => {
    const result = await MetalType.findByIdAndDelete(id);
    return result;
}

// update metaltype
exports.updateMetalTypeService = async (id, payload) => {
    const isExist = await MetalType.findOne({ _id: id })

    if (!isExist) {
        throw new ApiError(404, 'MetalType not found !')
    }

    const result = await MetalType.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    })
    return result
}

// get single metaltype
exports.getSingleMetalTypeService = async (id) => {
    const result = await MetalType.findById(id);
    return result;
}