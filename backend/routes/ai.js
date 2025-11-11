const express = require('express');
const { AIChatSession, AIKnowledgeBase } = require('../models/AIChat');
const NGO = require('../models/NGO');
const protect = require('../middleware/auth');
const AIService = require('../services/aiService');

const router = express.Router();
const aiService = new AIService();

// Get or create AI chat session
router.get('/chat/session', protect, async (req, res) => {
  try {
    let session = await AIChatSession.findOne({
      user: req.user._id,
      isActive: true
    });

    if (!session) {
      const userNGO = await NGO.findById(req.user.ngo);
      
      session = await AIChatSession.create({
        user: req.user._id,
        ngo: req.user.ngo,
        title: 'NGO Assistance Session',
        context: {
          userRole: req.user.role,
          ngoFocus: userNGO?.focusAreas || [],
          currentProjects: [],
          preferences: {}
        },
        messages: [{
          role: 'assistant',
          content: `Hello! I'm your NGO Assistant. I can help you with:\n\n• Finding partner NGOs\n• Data analysis and insights\n• Project management tips\n• Volunteer coordination\n• Fundraising strategies\n• Impact measurement\n\nHow can I assist your NGO today?`
        }]
      });
    }

    await session.populate('ngo', 'name focusAreas');

    res.json({
      status: 'success',
      data: session
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send message to AI
router.post('/chat/message', protect, async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    let session;
    if (sessionId) {
      session = await AIChatSession.findById(sessionId);
    } else {
      session = await AIChatSession.findOne({
        user: req.user._id,
        isActive: true
      });
    }

    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: message
    });

    // Generate AI response
    const aiResponse = await aiService.generateResponse(message, session.context);
    
    // Add AI response
    session.messages.push({
      role: 'assistant',
      content: aiResponse.response,
      metadata: {
        suggestions: aiResponse.suggestions,
        actions: aiResponse.actions,
        references: aiResponse.references
      }
    });

    await session.save();

    res.json({
      status: 'success',
      data: {
        message: aiResponse.response,
        suggestions: aiResponse.suggestions,
        sessionId: session._id
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get AI knowledge base
router.get('/knowledge/:category', protect, async (req, res) => {
  try {
    const { category } = req.params;
    const knowledge = await AIKnowledgeBase.find({ category })
      .sort({ relevanceScore: -1 })
      .limit(10);

    res.json({
      status: 'success',
      results: knowledge.length,
      data: knowledge
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Analyze NGO data and provide insights
router.post('/analyze/ngo-data', protect, async (req, res) => {
  try {
    const { dataType, data } = req.body;
    
    const analysis = await aiService.analyzeData(dataType, data, req.user.ngo);

    res.json({
      status: 'success',
      data: analysis
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;