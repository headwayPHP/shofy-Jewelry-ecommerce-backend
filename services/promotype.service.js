const ApiError = require('../errors/api-error');
const PromoType = require('../model/PromoType');
const Products = require('../model/Products');

// create promotype service
// exports.createPromoTypeService = async (data) => {
//   const promotype = await PromoType.create(data);
//   return promotype;
// }
exports.createPromoTypeService = async (data) => {
    try {
        return await PromoType.create(data);
    } catch (error) {
        if (error.code === 11000) {  // MongoDB duplicate key error
            throw new Error("PromoType name must be unique");
        }
        throw error;
    }
};

// create all promotype service
exports.addAllPromoTypeService = async (data) => {
    await PromoType.deleteMany()
    const promotype = await PromoType.insertMany(data);
    return promotype;
}

// get all show promotype service
exports.getShowPromoTypeServices = async () => {
    const promotype = await PromoType.find({ status: 'Show' }).populate('products');
    return promotype;
}

// get all promotype 
exports.getAllPromoTypeServices = async () => {
    const promotype = await PromoType.find({})
    return promotype;
}

// get type of promotype service
exports.getPromoTypeTypeService = async (param) => {
    const categories = await PromoType.find({ productType: param }).populate('products');
    return categories;
}

// get type of promotype service
exports.deletePromoTypeService = async (id) => {
    const result = await PromoType.findByIdAndDelete(id);
    return result;
}

// update promotype
exports.updatePromoTypeService = async (id, payload) => {
    const isExist = await PromoType.findOne({ _id: id })

    if (!isExist) {
        throw new ApiError(404, 'PromoType not found !')
    }

    const result = await PromoType.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    })
    return result
}

// get single promotype
exports.getSinglePromoTypeService = async (id) => {
    const result = await PromoType.findById(id);
    return result;
}