const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  clientEmail: {
    type: String,
    required: [true, 'Client email is required'],
    trim: true,
    lowercase: true
  },
  clientPhone: {
    type: String,
    trim: true
  },
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    default: 'Bespoke Interior Renovation'
  },
  designerName: {
    type: String,
    default: 'Priya Sharma (Lead Architect)'
  },
  totalProjectAmount: {
    type: Number,
    required: true,
    default: 500000
  },
  milestoneTitle: {
    type: String,
    required: true,
    default: '50% Half Payment - 3D Render Signoff & Material Procurement'
  },
  amountPaid: {
    type: Number,
    required: [true, 'Amount paid is required']
  },
  paymentMethod: {
    type: String,
    enum: ['UPI / QR Code', 'Credit / Debit Card', 'Net Banking', 'Bank Transfer / NEFT'],
    default: 'UPI / QR Code'
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  receiptNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed', 'Refunded'],
    default: 'Completed'
  },
  notes: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
