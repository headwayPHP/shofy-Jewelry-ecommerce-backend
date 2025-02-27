const ApiError = require('../errors/api-error');
const Purity = require('../model/Purity.js');
const Products = require('../model/Products');

exports.createPurityService = async (data) => {
    try {
        return await Purity.create(data);
    } catch (error) {
        if (error.code === 11000) {  // MongoDB duplicate key error
            throw new Error("Purity name must be unique");
        }
        throw error;
    }
};

// create all purity service
exports.addAllPurityService = async (data) => {
    await Purity.deleteMany()
    const purity = await Purity.insertMany(data);
    return purity;
}

// get all show purity service
exports.getShowPurityServices = async () => {
    const purity = await Purity.find({ status: 'Show' }).populate('products');
    return purity;
}

// get all purity 
exports.getAllPurityServices = async () => {
    const purity = await Purity.find({})
    return purity;
}

// get type of purity service
exports.getPurityTypeService = async (param) => {
    const categories = await Purity.find({ productType: param }).populate('products');
    return categories;
}

// get type of purity service
exports.deletePurityService = async (id) => {
    const result = await Purity.findByIdAndDelete(id);
    return result;
}

// update purity
exports.updatePurityService = async (id, payload) => {
    const isExist = await Purity.findOne({ _id: id })

    if (!isExist) {
        throw new ApiError(404, 'Purity not found !')
    }

    const result = await Purity.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    })
    return result
}

// get single purity
exports.getSinglePurityService = async (id) => {
    const result = await Purity.findById(id);
    return result;
}