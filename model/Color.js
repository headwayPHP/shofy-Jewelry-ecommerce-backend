const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const ColorSchema = mongoose.Schema({
    color_name: {
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

const Color = mongoose.model('Color', ColorSchema);
module.exports = Color;