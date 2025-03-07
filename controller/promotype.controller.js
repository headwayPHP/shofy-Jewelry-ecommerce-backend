const promotypeServices = require("../services/promotype.service.js");


exports.addPromoType = async (req, res, next) => {
    try {
        const result = await promotypeServices.createPromoTypeService(req.body);
        res.status(201).json({
            status: "success",
            message: "PromoType created successfully!",
            data: result,
        });
    } catch (error) {
        console.log(error);

        if (error.code === 11000) {
            return res.status(400).json({
                status: "fail",
                message: "PromoType name must be unique",
            });
        }

        next(error);
    }
};
// add all promotype
exports.addAllPromoType = async (req, res, next) => {
    try {
        const result = await promotypeServices.addAllPromoTypeService(req.body);
        res.json({
            message: 'PromoType added successfully',
            result,
        })
    } catch (error) {
        next(error)
    }
}

// add all promotype
exports.getShowPromoType = async (req, res, next) => {
    try {
        const result = await promotypeServices.getShowPromoTypeServices();
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}

// add all promotype
exports.getAllPromoType = async (req, res, next) => {
    try {
        const result = await promotypeServices.getAllPromoTypeServices();
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}


// add all promotype
exports.getProductTypePromoType = async (req, res, next) => {
    try {
        const result = await promotypeServices.getPromoTypeTypeService(req.params.type);
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}

// delete promotype
exports.deletePromoType = async (req, res, next) => {
    try {
        const result = await promotypeServices.deletePromoTypeService(req.params.id);
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}

// update promotype
exports.updatePromoType = async (req, res, next) => {
    try {
        console.log(req.params.id, req.body);
        const result = await promotypeServices.updatePromoTypeService(req.params.id, req.body);
        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

// get single promotype
exports.getSinglePromoType = async (req, res, next) => {
    try {
        const result = await promotypeServices.getSinglePromoTypeService(req.params.id);
        res.status(200).json({
            success: true,
            result: result,
        })
    } catch (error) {
        next(error)
    }
}