const Payment = require('../models/Payment');

// CREATE / RECORD a new payment
exports.createPayment = async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      projectName,
      designerName,
      totalProjectAmount,
      milestoneTitle,
      amountPaid,
      paymentMethod,
      notes,
      userId
    } = req.body;

    if (!clientName || !clientEmail || !amountPaid) {
      return res.status(400).json({
        message: 'Client name, email, and amount are required.'
      });
    }

    // Generate unique transaction & receipt IDs
    const timestamp = Date.now().toString().slice(-6);
    const randomHex = Math.floor(Math.random() * 8999 + 1000);
    const transactionId = `TXN-${timestamp}-${randomHex}`;
    const receiptNumber = `INV-${new Date().getFullYear()}-${timestamp}`;

    const mongoose = require('mongoose');
    const isValidUser = userId && mongoose.Types.ObjectId.isValid(userId) && String(userId).length === 24;

    const payment = new Payment({
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim().toLowerCase(),
      clientPhone: clientPhone ? clientPhone.trim() : '',
      projectName: projectName || 'Bespoke Interior Renovation',
      designerName: designerName || 'Priya Sharma (Lead Architect)',
      totalProjectAmount: Number(totalProjectAmount) || 500000,
      milestoneTitle: milestoneTitle || '50% Half Payment - 3D Render Signoff & Procurement',
      amountPaid: Number(amountPaid),
      paymentMethod: paymentMethod || 'UPI / QR Code',
      transactionId,
      receiptNumber,
      status: 'Completed',
      notes,
      userId: isValidUser ? userId : undefined
    });

    const savedPayment = await payment.save();

    res.status(201).json({
      message: 'Payment processed successfully! Receipt generated.',
      payment: savedPayment
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      message: 'Failed to record payment.',
      error: error.message
    });
  }
};

// GET all payments (with optional clientEmail or userId filter)
exports.getAllPayments = async (req, res) => {
  try {
    const { clientEmail, userId, search } = req.query;
    let filter = {};

    if (clientEmail) {
      filter.clientEmail = { $regex: new RegExp(`^${clientEmail.trim()}$`, 'i') };
    }
    if (userId) filter.userId = userId;

    if (search) {
      filter.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { projectName: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { receiptNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const payments = await Payment.find(filter).sort({ createdAt: -1 });

    // Calculate billing summary stats
    const totalCollected = payments.reduce((acc, p) => acc + (p.status === 'Completed' ? p.amountPaid : 0), 0);

    res.status(200).json({
      count: payments.length,
      totalCollected,
      payments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      message: 'Failed to retrieve payments.',
      error: error.message
    });
  }
};

// GET single payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found.' });
    }
    res.status(200).json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      message: 'Failed to retrieve payment record.',
      error: error.message
    });
  }
};
