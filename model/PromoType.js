const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const PromoTypeSchema = mongoose.Schema({
    promotype_name: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ['Show', 'Hide'],
        default: 'Show',
    },
}, {
    timestamps: true
})

const PromoType = mongoose.model('PromoType', PromoTypeSchema);
module.exports = PromoType;