const Banner = require('../model/Banner'); // Ensure this path is correct

// Create a new banner
exports.createBannerService = async (data) => {
    return await Banner.create(data);
};

// Get all banners (admin)
exports.getAllBannersService = async () => {
    // return await Banner.find({}).sort({ order: 1, createdAt: -1 });
    return await Banner.find({}).sort({ createdAt: -1 });

};

// Get active banners (for frontend)
exports.getActiveBannersService = async () => {
    return await Banner.find({ status: 'Show' }).sort({ order: 1, createdAt: -1 });
};

// Get single banner by ID
exports.getSingleBannerService = async (id) => {
    return await Banner.findById(id);
};

// Update banner
exports.updateBannerService = async (id, data) => {
    return await Banner.findByIdAndUpdate(id, data, { new: true });
};

// Delete banner
exports.deleteBannerService = async (id) => {
    return await Banner.findByIdAndDelete(id);
};