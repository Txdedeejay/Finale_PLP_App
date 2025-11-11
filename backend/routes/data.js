const express = require('express');
const { Form, Response, Analytics } = require('../models/DataCollection');
const protect = require('../middleware/auth');

const router = express.Router();

// Create form
router.post('/forms', protect, async (req, res) => {
  try {
    const form = await Form.create({
      ...req.body,
      createdBy: req.user._id,
      ngo: req.user.ngo
    });

    res.status(201).json({
      status: 'success',
      data: form
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all forms for NGO
router.get('/forms', protect, async (req, res) => {
  try {
    const forms = await Form.find({ ngo: req.user.ngo })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: forms.length,
      data: forms
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit form response
router.post('/forms/:formId/responses', async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers, respondent } = req.body;

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const response = await Response.create({
      form: formId,
      respondent,
      answers,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        completedAt: new Date()
      }
    });

    // Update form analytics
    await Form.findByIdAndUpdate(formId, {
      $inc: { 'analytics.totalResponses': 1 }
    });

    res.status(201).json({
      status: 'success',
      data: response
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get form responses
router.get('/forms/:formId/responses', protect, async (req, res) => {
  try {
    const { formId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const responses = await Response.find({ form: formId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Response.countDocuments({ form: formId });

    res.json({
      status: 'success',
      results: responses.length,
      data: responses,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics for NGO
router.get('/analytics', protect, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);

    // Get form analytics
    const forms = await Form.find({ ngo: req.user.ngo });
    const formAnalytics = {
      totalForms: forms.length,
      totalResponses: forms.reduce((sum, form) => sum + form.analytics.totalResponses, 0),
      averageRating: 4.2, // This would be calculated from actual data
      completionRate: '78%'
    };

    // Get response trends
    const recentResponses = await Response.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          form: { $in: forms.map(f => f._id) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      status: 'success',
      data: {
        formAnalytics,
        responseTrends: recentResponses,
        insights: generateInsights(formAnalytics, recentResponses)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function generateInsights(analytics, trends) {
  const insights = [];
  
  if (analytics.totalResponses > 100) {
    insights.push('High engagement rate detected. Consider expanding data collection efforts.');
  }
  
  if (trends.length > 0) {
    const recentTrend = trends.slice(-7);
    if (recentTrend.length >= 2) {
      const growth = ((recentTrend[recentTrend.length - 1].count - recentTrend[0].count) / recentTrend[0].count) * 100;
      if (growth > 0) {
        insights.push(`Response growth: +${growth.toFixed(1)}% in the last week`);
      }
    }
  }

  insights.push('Consider implementing mobile-optimized forms for better response rates.');
  insights.push('Weekly response analysis can help identify engagement patterns.');

  return insights;
}

module.exports = router;