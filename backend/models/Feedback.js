const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  clientEmail: {
    type: String,
    required: [true, 'Please provide your email'],
    trim: true,
    lowercase: true
  },
  projectName: {
    type: String,
    required: [true, 'Project title or space scope is required'],
    default: '3 BHK Residential Interior'
  },
  designerName: {
    type: String,
    required: [true, 'Assigned designer name is required'],
    default: 'Priya Sharma (Lead Designer)'
  },
  projectStage: {
    type: String,
    enum: [
      'Initial Consultation & Space Planning',
      '3D Concept Renders & Material Selection',
      'On-site Carpentry & Execution',
      'Final Handover & Completed Project'
    ],
    default: '3D Concept Renders & Material Selection'
  },
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5
  },
  communicationRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  qualityRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  timelinessRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  comments: {
    type: String,
    required: [true, 'Please share your ongoing review or experience'],
    trim: true
  },
  recommend: {
    type: Boolean,
    default: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
