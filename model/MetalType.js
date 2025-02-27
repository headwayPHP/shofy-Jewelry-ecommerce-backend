const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const MetalTypeSchema = mongoose.Schema({
    metal_name: {
        type: String,
        required: true,
        unique: true
    },
    products: [{
        type: ObjectId,
        ref: "Products"
    }],
    status: {
        type: String,
        enum: ['Show', 'Hide'],
        default: 'Show',
    },
}, {
    timestamps: true
})

const MetalType = mongoose.model('MetalType', MetalTypeSchema);
module.exports = MetalType;