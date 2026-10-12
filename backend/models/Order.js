const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  image: {
    type: String
  },
  category: {
    type: String
  },
  material: {
    type: String
  },
  dimensions: {
    type: String
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  clientName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  clientEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    trim: true,
    lowercase: true
  },
  clientPhone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['UPI / QR Code', 'Credit / Debit Card', 'Net Banking', 'Cash on Delivery'],
    default: 'UPI / QR Code'
  },
  paymentStatus: {
    type: String,
    enum: ['Completed', 'Pending', 'Cash on Delivery', 'Refunded'],
    default: 'Completed'
  },
  orderStatus: {
    type: String,
    enum: ['Processing', 'Dispatched', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
