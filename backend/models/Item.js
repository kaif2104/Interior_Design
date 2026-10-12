const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Item category is required'],
    enum: [
      'Lighting & Lamps',
      'Seating & Chairs',
      'Cupboards & Wardrobes',
      'Cabinets & Storage',
      'Wallpapers & Wall Decor',
      'Tables & Consoles',
      'Rugs & Textiles',
      'Decor & Accents'
    ],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Item price is required']
  },
  originalPrice: {
    type: Number
  },
  dimensions: {
    type: String,
    trim: true
  },
  material: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  leadTime: {
    type: String,
    default: '3-5 Business Days',
    trim: true
  },
  images: [{
    type: String
  }],
  description: {
    type: String,
    required: [true, 'Item description is required'],
    trim: true
  },
  features: [{
    type: String
  }],
  specifications: {
    type: Map,
    of: String
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 4.8
  },
  reviewCount: {
    type: Number,
    default: 14
  }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
