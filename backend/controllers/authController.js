const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: role || 'client'
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully! Please login.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// LOGIN WITH COOKIES & SESSIONS
exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'interiorDesignSecretKey123',
      { expiresIn: rememberMe ? '30d' : '7d' }
    );

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    // Store in server session
    if (req.session) {
      req.session.user = userData;
      req.session.token = token;
    }

    // Set secure HTTP cookies
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    res.cookie('token', token, {
      maxAge: cookieMaxAge,
      httpOnly: false,
      sameSite: 'lax'
    });

    res.cookie('user_session', JSON.stringify(userData), {
      maxAge: cookieMaxAge,
      httpOnly: false,
      sameSite: 'lax'
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userData,
      sessionActive: true
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET CURRENT SESSION / ME
exports.getMe = async (req, res) => {
  try {
    // 1. Check server session
    if (req.session && req.session.user) {
      return res.status(200).json({
        user: req.session.user,
        authenticated: true,
        source: 'server_session'
      });
    }

    // 2. Check token from cookie or authorization header
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No active session found', authenticated: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'interiorDesignSecretKey123');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists', authenticated: false });
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    if (req.session) {
      req.session.user = userData;
    }

    res.status(200).json({
      user: userData,
      authenticated: true,
      source: 'jwt_cookie'
    });
  } catch (error) {
    res.status(401).json({ message: 'Session expired or invalid', authenticated: false });
  }
};

// LOGOUT (Clear Cookies & Destroy Session)
exports.logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.clearCookie('user_session');

    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
      });
    }

    res.status(200).json({ message: 'Logged out successfully, session cleared.' });
  } catch (error) {
    res.status(500).json({ message: 'Error during logout', error: error.message });
  }
};

// GET ALL USERS (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
  }
};

// GET ADMIN DASHBOARD STATS
exports.getAdminStats = async (req, res) => {
  try {
    const Consultation = require('../models/Consultation');
    const Payment = require('../models/Payment');
    const Portfolio = require('../models/Portfolio');

    const totalUsers = await User.countDocuments();
    const totalConsultations = await Consultation.countDocuments();
    const pendingConsultations = await Consultation.countDocuments({ status: 'Pending' });
    const inProgressConsultations = await Consultation.countDocuments({ status: { $in: ['Site Visit Scheduled', 'In Progress'] } });
    const completedConsultations = await Consultation.countDocuments({ status: 'Completed' });

    const totalProjects = await Portfolio.countDocuments();

    const allPayments = await Payment.find({ status: 'Completed' });
    const totalRevenue = allPayments.reduce((acc, p) => acc + (p.amountPaid || 0), 0);

    const recentConsultations = await Consultation.find().sort({ createdAt: -1 }).limit(5);
    const recentPayments = await Payment.find().sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      totalUsers,
      totalConsultations,
      pendingConsultations,
      inProgressConsultations,
      completedConsultations,
      totalProjects,
      totalRevenue,
      totalPaymentsCount: allPayments.length,
      recentConsultations,
      recentPayments
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Failed to retrieve admin stats', error: error.message });
  }
};