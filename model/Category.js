const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const CategorySchema = mongoose.Schema({
  category_name: {
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

const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;