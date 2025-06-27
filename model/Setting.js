const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: String, required: true }, // can be text or image filename
    type: { type: String, enum: ['text', 'image'], default: 'text' },
    status: { type: Boolean, default: true },
    group: { type: String },
    desc: { type: String },
}, { timestamps: true });


module.exports = mongoose.model('Setting', settingSchema);
