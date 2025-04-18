const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const BannerSchema = new mongoose.Schema({
    banner_title: {
        type: String,
        required: true,
    },
    banner_image: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Show', 'Hide'],
        default: 'Show',
    },
    link: {  // Optional: Where the banner redirects (e.g., product/category URL)
        type: String,
        default: '',
    },
    order: {  // For sorting banners (optional)
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Banner', BannerSchema);