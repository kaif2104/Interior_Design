const express = require('express');
const router = express.Router();
const {
  createConsultation,
  getAllConsultations,
  getConsultationById,
  updateConsultationStatus,
  deleteConsultation
} = require('../controllers/consultationController');

// Consultation routes
router.post('/', createConsultation);
router.get('/', getAllConsultations);
router.get('/:id', getConsultationById);
router.patch('/:id/status', updateConsultationStatus);
router.put('/:id', updateConsultationStatus);
router.delete('/:id', deleteConsultation);

module.exports = router;
