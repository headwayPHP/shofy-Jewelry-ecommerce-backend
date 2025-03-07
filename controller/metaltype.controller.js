const metaltypeServices = require("../services/metaltype.service");


// add metaltype
exports.addMetalType = async (req, res, next) => {
    try {
        const result = await metaltypeServices.createMetalTypeService(req.body);
        res.status(201).json({
            status: "success",
            message: "MetalType created successfully!",
            data: result,
        });
    } catch (error) {
        console.log(error);

        if (error.code === 11000) {
            return res.status(400).json({
                status: "fail",
                message: "MetalType name must be unique",
            });
        }

        next(error);
    }
};

// add all metaltype
exports.addAllMetalType = async (req, res, next) => {
    try {
        const result = await metaltypeServices.addAllMetalTypeService(req.body);
        res.json({
            message: 'MetalType added successfully',
            result,
        })
    } catch (error) {
        next(error)
    }
}

// add all metaltype
exports.getShowMetalType = async (req, res, next) => {
    try {
        const result = await metaltypeServices.getShowMetalTypeServices();
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}

// add all metaltype
exports.getAllMetalType = async (req, res, next) => {
    try {
        const result = await metaltypeServices.getAllMetalTypeServices();
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}


// add all metaltype
exports.getProductTypeMetalType = async (req, res, next) => {
    try {
        const result = await metaltypeServices.getMetalTypeTypeService(req.params.type);
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}

// delete metaltype
exports.deleteMetalType = async (req, res, next) => {
    try {
        const result = await metaltypeServices.deleteMetalTypeService(req.params.id);
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}

// update metaltype
exports.updateMetalType = async (req, res, next) => {
    try {
        const result = await metaltypeServices.updateMetalTypeService(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            message: 'MetalType update successfully',
            result,
        })
    } catch (error) {
        next(error)
    }
}

// get single metaltype
exports.getSingleMetalType = async (req, res, next) => {
    try {
        const result = await metaltypeServices.getSingleMetalTypeService(req.params.id);
        res.status(200).json({
            success: true,
            result: result,
        })
    } catch (error) {
        next(error)
    }
}