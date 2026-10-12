const express = require('express');
const router = express.Router();
const {
  createPayment,
  getAllPayments,
  getPaymentById
} = require('../controllers/paymentController');

router.post('/', createPayment);
router.get('/', getAllPayments);
router.get('/:id', getPaymentById);

module.exports = router;
