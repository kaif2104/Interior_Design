const Consultation = require('../models/Consultation');

// CREATE a new consultation request
exports.createConsultation = async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      propertyType,
      roomType,
      preferredStyle,
      budgetRange,
      areaSize,
      preferredDate,
      preferredTimeSlot,
      notes,
      referenceProject,
      referenceProjectTitle,
      userId
    } = req.body;

    if (!clientName || !clientEmail || !clientPhone || !roomType) {
      return res.status(400).json({
        message: 'Name, email, phone number, and room type are required.'
      });
    }

    const mongoose = require('mongoose');

    const isValidRef = referenceProject && mongoose.Types.ObjectId.isValid(referenceProject) && String(referenceProject).length === 24;
    const isValidUser = userId && mongoose.Types.ObjectId.isValid(userId) && String(userId).length === 24;
    const validDate = preferredDate && !isNaN(new Date(preferredDate).getTime()) ? new Date(preferredDate) : undefined;

    const consultation = new Consultation({
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim().toLowerCase(),
      clientPhone: clientPhone.trim(),
      propertyType: propertyType || '2 BHK',
      roomType: roomType || 'Full Home Renovation',
      preferredStyle: preferredStyle || 'Modern',
      budgetRange: budgetRange || '₹3L - ₹6L',
      areaSize: areaSize || '',
      preferredDate: validDate,
      preferredTimeSlot: preferredTimeSlot || 'Morning (10:00 AM - 1:00 PM)',
      notes: notes || '',
      referenceProject: isValidRef ? referenceProject : undefined,
      referenceProjectTitle: referenceProjectTitle || '',
      userId: isValidUser ? userId : undefined
    });

    const savedConsultation = await consultation.save();

    res.status(201).json({
      message: 'Consultation request submitted successfully!',
      consultation: savedConsultation
    });
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({
      message: 'Failed to submit consultation request.',
      error: error.message
    });
  }
};

// GET all consultations (with optional status, roomType, clientEmail & userId filters)
exports.getAllConsultations = async (req, res) => {
  try {
    const { status, roomType, clientEmail, userId } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (roomType) filter.roomType = roomType;
    if (clientEmail) {
      filter.clientEmail = { $regex: new RegExp(`^${clientEmail.trim()}$`, 'i') };
    }
    if (userId) filter.userId = userId;

    const consultations = await Consultation.find(filter)
      .populate('referenceProject', 'title category style budgetRange images')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(consultations);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({
      message: 'Failed to retrieve consultations.',
      error: error.message
    });
  }
};

// GET single consultation by ID
exports.getConsultationById = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('referenceProject')
      .populate('userId', 'name email phone');

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation request not found.' });
    }

    res.status(200).json(consultation);
  } catch (error) {
    console.error('Error fetching consultation by ID:', error);
    res.status(500).json({
      message: 'Failed to retrieve consultation details.',
      error: error.message
    });
  }
};

// UPDATE consultation status & admin remarks / meeting arrangement
exports.updateConsultationStatus = async (req, res) => {
  try {
    const {
      status,
      adminNotes,
      meetingDate,
      meetingTimeSlot,
      meetingMode,
      meetingLocation,
      meetingLink,
      adminMessage,
      isRescheduledByAdmin
    } = req.body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;
    if (meetingDate !== undefined) updateFields.meetingDate = meetingDate;
    if (meetingTimeSlot !== undefined) updateFields.meetingTimeSlot = meetingTimeSlot;
    if (meetingMode !== undefined) updateFields.meetingMode = meetingMode;
    if (meetingLocation !== undefined) updateFields.meetingLocation = meetingLocation;
    if (meetingLink !== undefined) updateFields.meetingLink = meetingLink;
    if (adminMessage !== undefined) updateFields.adminMessage = adminMessage;
    if (isRescheduledByAdmin !== undefined) updateFields.isRescheduledByAdmin = isRescheduledByAdmin;

    const updatedConsultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedConsultation) {
      return res.status(404).json({ message: 'Consultation request not found.' });
    }

    res.status(200).json({
      message: 'Consultation status updated successfully.',
      consultation: updatedConsultation
    });
  } catch (error) {
    console.error('Error updating consultation status:', error);
    res.status(500).json({
      message: 'Failed to update consultation.',
      error: error.message
    });
  }
};

// DELETE consultation
exports.deleteConsultation = async (req, res) => {
  try {
    const deleted = await Consultation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Consultation request not found.' });
    }

    res.status(200).json({ message: 'Consultation request deleted successfully.' });
  } catch (error) {
    console.error('Error deleting consultation:', error);
    res.status(500).json({
      message: 'Failed to delete consultation.',
      error: error.message
    });
  }
};
