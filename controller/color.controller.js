const colorServices = require("../services/color.service.js");


exports.addColor = async (req, res, next) => {
    try {
        const result = await colorServices.createColorService(req.body);
        res.status(201).json({
            status: "success",
            message: "Color created successfully!",
            data: result,
        });
    } catch (error) {
        console.log(error);

        if (error.code === 11000) {
            return res.status(400).json({
                status: "fail",
                message: "Color name must be unique",
            });
        }

        next(error);
    }
};
// add all color
exports.addAllColor = async (req, res, next) => {
    try {
        const result = await colorServices.addAllColorService(req.body);
        res.json({
            message: 'Color added successfully',
            result,
        })
    } catch (error) {
        next(error)
    }
}

// add all color
exports.getShowColor = async (req, res, next) => {
    try {
        const result = await colorServices.getShowColorServices();
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}

// add all color
exports.getAllColor = async (req, res, next) => {
    try {
        const result = await colorServices.getAllColorServices();
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}


// add all color
exports.getProductTypeColor = async (req, res, next) => {
    try {
        const result = await colorServices.getColorTypeService(req.params.type);
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}

// delete color
exports.deleteColor = async (req, res, next) => {
    try {
        const result = await colorServices.deleteColorService(req.params.id);
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}

// update color
exports.updateColor = async (req, res, next) => {
    try {
        const result = await colorServices.updateColorService(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            message: 'Color update successfully',
            result,
        })
    } catch (error) {
        next(error)
    }
}

// get single color
exports.getSingleColor = async (req, res, next) => {
    try {
        const result = await colorServices.getSingleColorService(req.params.id);
        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}