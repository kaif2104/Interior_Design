const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true // e.g. "Living Room", "Bedroom", "Kitchen", "Office"
  },
  style: {
    type: String,
    required: true // e.g. "Modern", "Minimalist", "Traditional"
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String // array of image URLs/paths
  }],
  budgetRange: {
    type: String // e.g. "₹2L - ₹4L"
  },
  areaSize: {
    type: String // e.g. "450 sq.ft."
  },
  duration: {
    type: String // e.g. "6 weeks"
  },
  designerName: {
    type: String // simple text for now, we'll link this properly once we build the Designers collection
  }
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);