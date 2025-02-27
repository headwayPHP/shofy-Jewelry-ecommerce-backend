const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const PuritySchema = mongoose.Schema({
    product_purity: {
        type: Number,
        required: true,
    },
    metal_type: { type: mongoose.Schema.Types.ObjectId, ref: "MetalType", required: true },
    status: {
        type: String,
        enum: ['Show', 'Hide'],
        default: 'Show',
    },
}, {
    timestamps: true
})

const Purity = mongoose.model('Purity', PuritySchema);
module.exports = Purity;