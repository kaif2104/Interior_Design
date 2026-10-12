const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  clientEmail: {
    type: String,
    required: [true, 'Please provide your email address'],
    trim: true,
    lowercase: true
  },
  clientPhone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    trim: true
  },
  propertyType: {
    type: String,
    default: '2 BHK',
    trim: true
  },
  roomType: {
    type: String,
    required: [true, 'Please select the space or room type'],
    default: 'Full Home Renovation',
    trim: true
  },
  preferredStyle: {
    type: String,
    default: 'Modern',
    trim: true
  },
  budgetRange: {
    type: String,
    default: '₹3L - ₹6L',
    trim: true
  },
  areaSize: {
    type: String,
    trim: true
  },
  preferredDate: {
    type: Date
  },
  preferredTimeSlot: {
    type: String,
    default: 'Morning (10:00 AM - 1:00 PM)',
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  referenceProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio'
  },
  referenceProjectTitle: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Meeting Arranged', 'Site Visit Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Contacted', 'Confirmed'],
    default: 'Pending'
  },
  meetingDate: {
    type: Date
  },
  meetingTimeSlot: {
    type: String,
    trim: true
  },
  meetingMode: {
    type: String,
    default: 'In-Person Site Visit',
    trim: true
  },
  meetingLocation: {
    type: String,
    trim: true
  },
  meetingLink: {
    type: String,
    trim: true
  },
  adminMessage: {
    type: String,
    trim: true
  },
  isRescheduledByAdmin: {
    type: Boolean,
    default: false
  },
  adminNotes: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);
