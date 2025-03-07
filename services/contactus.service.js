const ApiError = require('../errors/api-error');
const Contactus = require('../model/Contactus');
const Products = require('../model/Products');

// create contactusservice
// exports.createContactusService = async (data) => {
//   const contactus= await Contactus.create(data);
//   return contactus;
// }
exports.createContactusService = async (data) => {
    try {
        return await Contactus.create(data);
    } catch (error) {
        if (error.code === 11000) {  // MongoDB duplicate key error
            throw new Error("Contactus name must be unique");
        }
        throw error;
    }
};

// create all contactusservice
exports.addAllContactusService = async (data) => {
    await Contactus.deleteMany()
    const contactus = await Contactus.insertMany(data);
    return contactus;
}

// get all show contactusservice
exports.getShowContactusServices = async () => {
    const contactus = await Contactus.find({ status: 'Show' }).populate('products');
    return contactus;
}

// get all contactus
exports.getAllContactusServices = async () => {
    const contactus = await Contactus.find({})
    return contactus;
}

// get type of contactusservice
exports.getContactusTypeService = async (param) => {
    const categories = await Contactus.find({ productType: param }).populate('products');
    return categories;
}

// get type of contactusservice
exports.deleteContactusService = async (id) => {
    const result = await Contactus.findByIdAndDelete(id);
    return result;
}

// update contactus
exports.updateContactusService = async (id, payload) => {
    const isExist = await Contactus.findOne({ _id: id })

    if (!isExist) {
        throw new ApiError(404, 'Contactus not found !')
    }

    const result = await Contactus.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    })
    return result
}

// get single contactus
exports.getSingleContactusService = async (id) => {
    const result = await Contactus.findById(id);
    return result;
}