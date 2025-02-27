const purityServices = require("../services/purity.service.js");


exports.addPurity = async (req, res, next) => {
    try {
        const result = await purityServices.createPurityService(req.body);
        res.status(201).json({
            status: "success",
            message: "Purity created successfully!",
            data: result,
        });
    } catch (error) {
        console.log(error);

        if (error.code === 11000) {
            return res.status(400).json({
                status: "fail",
                message: "Purity name must be unique",
            });
        }

        next(error);
    }
};
// add all purity
exports.addAllPurity = async (req, res, next) => {
    try {
        const result = await purityServices.addAllPurityService(req.body);
        res.json({
            message: 'Purity added successfully',
            result,
        })
    } catch (error) {
        next(error)
    }
}

// add all purity
exports.getShowPurity = async (req, res, next) => {
    try {
        const result = await purityServices.getShowPurityServices();
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}

// add all purity
exports.getAllPurity = async (req, res, next) => {
    try {

        const result = await purityServices.getAllPurityServices();
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}


// add all purity
exports.getProductTypePurity = async (req, res, next) => {
    try {
        const result = await purityServices.getPurityTypeService(req.params.type);
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}

// delete purity
exports.deletePurity = async (req, res, next) => {
    try {
        const result = await purityServices.deletePurityService(req.body.id);
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}

// update purity
exports.updatePurity = async (req, res, next) => {
    try {
        const result = await purityServices.updatePurityService(req.body.id, req.body);
        res.status(200).json({
            status: 'success',
            message: 'Purity update successfully',
            result,
        })
    } catch (error) {
        next(error)
    }
}

// get single purity
exports.getSinglePurity = async (req, res, next) => {
    try {
        const result = await purityServices.getSinglePurityService(req.body.id);
        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}