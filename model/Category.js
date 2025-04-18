const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const CategorySchema = new mongoose.Schema({
  category_name: {
    type: String,
    required: true,
    unique: true,
  },
  category_image: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Show', 'Hide'],
    default: 'Show',
  },
  products: [{
    type: ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Make sure this is properly exported
module.exports = mongoose.model('Category', CategorySchema);