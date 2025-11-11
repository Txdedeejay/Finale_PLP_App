const mongoose = require('mongoose');

const aiChatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO'
  },
  title: String,
  context: {
    userRole: String,
    ngoFocus: [String],
    currentProjects: [String],
    preferences: mongoose.Schema.Types.Mixed
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      suggestions: [String],
      actions: [String],
      references: [String]
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  summary: String,
  tags: [String]
}, {
  timestamps: true
});

const aiKnowledgeBaseSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      'fundraising', 'volunteer_management', 'project_planning',
      'impact_measurement', 'partner_matching', 'legal_compliance',
      'technology', 'sustainability', 'community_engagement'
    ],
    required: true
  },
  title: String,
  content: String,
  keywords: [String],
  examples: [String],
  bestPractices: [String],
  resources: [{
    title: String,
    url: String,
    type: String
  }],
  relevanceScore: Number
});

module.exports = {
  AIChatSession: mongoose.model('AIChatSession', aiChatSessionSchema),
  AIKnowledgeBase: mongoose.model('AIKnowledgeBase', aiKnowledgeBaseSchema)
};