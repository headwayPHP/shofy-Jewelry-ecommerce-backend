const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const ContactusSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    contact_status: {
        type: String,
        enum: ['Submitted', 'Resolved', 'Contacted', 'In Progress'],
        default: 'Submitted',
    },
    message: {
        type: String,
        required: true,
    },
    remember: {
        type: Boolean,
        required: true,
    },
    status: {
        type: String,
        enum: ['Show', 'Hide'],
        default: 'Show',
    },
}, {
    timestamps: true
})

const Contactus = mongoose.model('Contactus', ContactusSchema);
module.exports = Contactus;