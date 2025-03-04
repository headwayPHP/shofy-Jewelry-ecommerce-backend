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
        console.error(error);

        if (error.code === 11000) {
            return res.status(400).json({
                status: "fail",
                message: "Purity name must be unique",
            });
        }

        next(error);
    }
};

// Add multiple purities
exports.addAllPurity = async (req, res, next) => {
    try {
        const result = await purityServices.addAllPurityService(req.body);
        res.status(201).json({
            status: "success",
            message: "Purities added successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Get all purities (Populating metal_name)
exports.getAllPurity = async (req, res, next) => {
    try {
        const result = await purityServices.getAllPurityServices();
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Get only "Show" purities
exports.getShowPurity = async (req, res, next) => {
    try {
        const result = await purityServices.getShowPurityServices();
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Get purities by product type
exports.getProductTypePurity = async (req, res, next) => {
    try {
        const result = await purityServices.getPurityTypeService(req.body.type);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Delete purity (Use req.body.id instead of req.body)
exports.deletePurity = async (req, res, next) => {
    try {
        const result = await purityServices.deletePurityService(req.body.id);
        res.status(200).json({
            success: true,
            message: "Purity deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Update purity (Use req.body.id instead of req.body)
exports.updatePurity = async (req, res, next) => {
    try {
        const result = await purityServices.updatePurityService(req.body.id, req.body);
        res.status(200).json({
            status: "success",
            message: "Purity updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Get single purity (Use req.body.id)
exports.getSinglePurity = async (req, res, next) => {
    try {
        const result = await purityServices.getSinglePurityService(req.body.id);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
