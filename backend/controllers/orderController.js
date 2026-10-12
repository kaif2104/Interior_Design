const Order = require('../models/Order');
const mongoose = require('mongoose');

// CREATE a new standalone item purchase order
exports.createOrder = async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes,
      userId
    } = req.body;

    if (!clientName || !clientEmail || !clientPhone || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({
        message: 'Name, email, phone, items list, and total amount are required.'
      });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({
        message: 'Complete shipping address (street, city, pincode) is required.'
      });
    }

    // Generate unique IDs
    const timestamp = Date.now().toString().slice(-6);
    const randomHex = Math.floor(Math.random() * 8999 + 1000);
    const orderNumber = `ORD-${timestamp}-${randomHex}`;
    const receiptNumber = `INV-ITEM-${new Date().getFullYear()}-${timestamp}`;
    const transactionId = paymentMethod === 'Cash on Delivery'
      ? `COD-${timestamp}-${randomHex}`
      : `TXN-ITEM-${timestamp}-${randomHex}`;

    const isValidUser = userId && mongoose.Types.ObjectId.isValid(userId) && String(userId).length === 24;

    const newOrder = new Order({
      orderNumber,
      items,
      totalAmount: Number(totalAmount),
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim().toLowerCase(),
      clientPhone: clientPhone.trim(),
      shippingAddress: {
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state ? shippingAddress.state.trim() : 'Maharashtra',
        pincode: shippingAddress.pincode.trim()
      },
      paymentMethod: paymentMethod || 'UPI / QR Code',
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : 'Completed',
      orderStatus: 'Processing',
      receiptNumber,
      transactionId,
      notes: notes || '',
      userId: isValidUser ? userId : undefined
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: 'Item order placed successfully! Tax invoice generated.',
      order: savedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      message: 'Failed to process item purchase.',
      error: error.message
    });
  }
};

// GET all orders (filter by clientEmail, userId, orderStatus, or search)
exports.getAllOrders = async (req, res) => {
  try {
    const { clientEmail, userId, orderStatus, search } = req.query;
    let filter = {};

    if (clientEmail) {
      filter.clientEmail = { $regex: new RegExp(`^${clientEmail.trim()}$`, 'i') };
    }
    if (userId) filter.userId = userId;
    if (orderStatus && orderStatus !== 'All') filter.orderStatus = orderStatus;

    if (search) {
      filter.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { clientEmail: { $regex: search, $options: 'i' } },
        { orderNumber: { $regex: search, $options: 'i' } },
        { receiptNumber: { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    const totalRevenue = orders.reduce(
      (acc, o) => acc + (o.paymentStatus === 'Completed' || o.paymentStatus === 'Cash on Delivery' ? o.totalAmount : 0),
      0
    );

    res.status(200).json({
      count: orders.length,
      totalRevenue,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      message: 'Failed to retrieve item orders.',
      error: error.message
    });
  }
};

// GET single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({
      message: 'Failed to retrieve order details.',
      error: error.message
    });
  }
};

// UPDATE order status (e.g. Processing -> Dispatched -> Delivered)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, notes } = req.body;
    const updateFields = {};

    if (orderStatus) updateFields.orderStatus = orderStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (notes !== undefined) updateFields.notes = notes;

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json({
      message: 'Order status updated successfully.',
      order: updated
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      message: 'Failed to update order status.',
      error: error.message
    });
  }
};

// DELETE order
exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.status(200).json({ message: 'Order deleted successfully.' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      message: 'Failed to delete order.',
      error: error.message
    });
  }
};
