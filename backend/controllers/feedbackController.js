const Feedback = require('../models/Feedback');
const mongoose = require('mongoose');

// SUBMIT feedback review
exports.createFeedback = async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      projectName,
      designerName,
      projectStage,
      overallRating,
      communicationRating,
      qualityRating,
      timelinessRating,
      comments,
      recommend,
      userId
    } = req.body;

    if (!clientName || !clientEmail || !comments) {
      return res.status(400).json({
        message: 'Name, email, and feedback comments are required.'
      });
    }

    const isValidUser = userId && mongoose.Types.ObjectId.isValid(userId) && String(userId).length === 24;

    const feedback = new Feedback({
      clientName,
      clientEmail,
      projectName: projectName || '3 BHK Residential Interior',
      designerName: designerName || 'Priya Sharma (Lead Designer)',
      projectStage: projectStage || '3D Concept Renders & Material Selection',
      overallRating: Number(overallRating) || 5,
      communicationRating: Number(communicationRating) || 5,
      qualityRating: Number(qualityRating) || 5,
      timelinessRating: Number(timelinessRating) || 5,
      comments,
      recommend: recommend !== undefined ? recommend : true,
      userId: userId || undefined
    });

    const savedFeedback = await feedback.save();

    res.status(201).json({
      message: 'Thank you! Your feedback has been published successfully.',
      feedback: savedFeedback
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({
      message: 'Failed to submit feedback.',
      error: error.message
    });
  }
};

// GET all feedback with stats calculation
exports.getAllFeedback = async (req, res) => {
  try {
    const { projectStage, rating, search } = req.query;
    let filter = {};

    if (projectStage) filter.projectStage = projectStage;
    if (rating) filter.overallRating = Number(rating);

    if (search) {
      filter.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { projectName: { $regex: search, $options: 'i' } },
        { designerName: { $regex: search, $options: 'i' } },
        { comments: { $regex: search, $options: 'i' } }
      ];
    }

    const feedbacks = await Feedback.find(filter).sort({ createdAt: -1 });

    // Calculate studio satisfaction metrics
    const totalReviews = feedbacks.length;
    let avgOverall = 5.0;
    let avgCommunication = 5.0;
    let avgQuality = 5.0;
    let avgTimeliness = 5.0;
    let recommendPercent = 100;

    if (totalReviews > 0) {
      const sumOverall = feedbacks.reduce((acc, f) => acc + (f.overallRating || 5), 0);
      const sumComm = feedbacks.reduce((acc, f) => acc + (f.communicationRating || 5), 0);
      const sumQuality = feedbacks.reduce((acc, f) => acc + (f.qualityRating || 5), 0);
      const sumTime = feedbacks.reduce((acc, f) => acc + (f.timelinessRating || 5), 0);
      const recommendedCount = feedbacks.filter((f) => f.recommend).length;

      avgOverall = (sumOverall / totalReviews).toFixed(1);
      avgCommunication = (sumComm / totalReviews).toFixed(1);
      avgQuality = (sumQuality / totalReviews).toFixed(1);
      avgTimeliness = (sumTime / totalReviews).toFixed(1);
      recommendPercent = Math.round((recommendedCount / totalReviews) * 100);
    }

    res.status(200).json({
      stats: {
        totalReviews,
        avgOverall,
        avgCommunication,
        avgQuality,
        avgTimeliness,
        recommendPercent
      },
      feedbacks
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      message: 'Failed to retrieve feedback.',
      error: error.message
    });
  }
};
