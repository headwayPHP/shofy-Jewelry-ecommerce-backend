const bannerService = require('../services/banner.service');
const multer = require('multer');

// Multer config (same as your category setup)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads'),
    filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Add new banner
exports.addBanner = async (req, res, next) => {
    try {
        if (!req.file || !req.body.banner_title) {
            return res.status(400).json({
                success: false,
                message: "Banner title and image are required!",
            });
        }

        const data = {
            banner_title: req.body.banner_title,
            banner_image: 'images/' + req.file.filename,
            status: req.body.status || 'Show',
            link: req.body.link || '',
            order: req.body.order || 0,
        };

        const result = await bannerService.createBannerService(data);
        res.status(201).json({
            success: true,
            message: "Banner created successfully!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Get all banners (admin)
exports.getAllBanners = async (req, res, next) => {
    try {
        const banners = await bannerService.getAllBannersService();
        const formattedBanners = banners.map(banner => ({
            ...banner.toObject(),
            banner_image: banner.banner_image ? `${process.env.ADMIN_URL}${banner.banner_image}` : null,
        }));
        res.status(200).json({ success: true, data: formattedBanners });
    } catch (error) {
        next(error);
    }
};

// Get single banner by ID
exports.getABanner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const banner = await bannerService.getSingleBannerService(id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        const formattedBanner = {
            ...banner.toObject(),
            banner_image: banner.banner_image ? `${process.env.ADMIN_URL}${banner.banner_image}` : null,
        };

        res.status(200).json({
            success: true,
            data: formattedBanner
        });
    } catch (error) {
        next(error);
    }
};

// Get active banners (frontend)
exports.getActiveBanners = async (req, res, next) => {
    try {
        const banners = await bannerService.getActiveBannersService();
        const formattedBanners = banners.map(banner => ({
            ...banner.toObject(),
            banner_image: banner.banner_image ? `${process.env.ADMIN_URL}${banner.banner_image}` : null,
        }));
        res.status(200).json({ success: true, data: formattedBanners });
    } catch (error) {
        next(error);
    }
};

// Update banner
exports.updateBanner = async (req, res, next) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.banner_image = 'images/' + req.file.filename;
        }
        const result = await bannerService.updateBannerService(req.params.id, data);
        res.status(200).json({
            success: true,
            message: "Banner updated successfully!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Delete banner
exports.deleteBanner = async (req, res, next) => {
    try {
        await bannerService.deleteBannerService(req.params.id);
        res.status(200).json({
            success: true,
            message: "Banner deleted successfully!",
        });
    } catch (error) {
        next(error);
    }
};