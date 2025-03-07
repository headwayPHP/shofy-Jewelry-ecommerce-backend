const contactusServices = require("../services/contactus.service.js");


exports.addContactus = async (req, res, next) => {
    try {
        const result = await contactusServices.createContactusService(req.body);
        res.status(201).json({
            status: "success",
            message: "Contactus created successfully!",
            data: result,
        });
    } catch (error) {
        console.log(error);

        if (error.code === 11000) {
            return res.status(400).json({
                status: "fail",
                message: "Contactus name must be unique",
            });
        }

        next(error);
    }
};
// add all contactus
exports.addAllContactus = async (req, res, next) => {
    try {
        const result = await contactusServices.addAllContactusService(req.body);
        res.json({
            message: 'Contactus added successfully',
            result,
        })
    } catch (error) {
        next(error)
    }
}

// add all contactus
exports.getShowContactus = async (req, res, next) => {
    try {
        const result = await contactusServices.getShowContactusServices();
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}

// add all contactus
exports.getAllContactus = async (req, res, next) => {
    try {
        const result = await contactusServices.getAllContactusServices();
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}


// add all contactus
exports.getProductTypeContactus = async (req, res, next) => {
    try {
        const result = await contactusServices.getContactusTypeService(req.params.type);
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}

// delete contactus
exports.deleteContactus = async (req, res, next) => {
    try {
        const result = await contactusServices.deleteContactusService(req.body.id);
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}

// update contactus
exports.updateContactus = async (req, res, next) => {
    try {

        const result = await contactusServices.updateContactusService(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            message: 'Contactus update successfully',
            result,
        })
    } catch (error) {
        next(error)
    }
}

// get single contactus
exports.getSingleContactus = async (req, res, next) => {
    try {
        console.log(req.params.id);

        const result = await contactusServices.getSingleContactusService(req.params.id);
        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}