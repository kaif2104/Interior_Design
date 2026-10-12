const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getMe,
  logout,
  getAllUsers,
  getAdminStats
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', getMe);
router.post('/logout', logout);
router.get('/users', getAllUsers);
router.get('/admin-stats', getAdminStats);

module.exports = router;