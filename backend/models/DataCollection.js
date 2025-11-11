const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true
  },
  questions: [{
    questionText: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      enum: ['text', 'rating', 'multiple_choice', 'checkbox', 'dropdown', 'date'],
      default: 'text'
    },
    options: [String],
    required: {
      type: Boolean,
      default: false
    },
    validation: {
      minLength: Number,
      maxLength: Number,
      minValue: Number,
      maxValue: Number
    }
  }],
  settings: {
    isActive: { type: Boolean, default: true },
    allowMultipleResponses: { type: Boolean, default: false },
    collectEmail: { type: Boolean, default: false },
    deadline: Date
  },
  analytics: {
    totalResponses: { type: Number, default: 0 },
    averageCompletionTime: Number,
    completionRate: Number
  }
}, {
  timestamps: true
});

const responseSchema = new mongoose.Schema({
  form: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  respondent: {
    name: String,
    email: String,
    location: String
  },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    answer: mongoose.Schema.Types.Mixed,
    questionText: String,
    questionType: String
  }],
  metadata: {
    ipAddress: String,
    userAgent: String,
    duration: Number, // in seconds
    completedAt: Date
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'completed'
  }
}, {
  timestamps: true
});

const analyticsSchema = new mongoose.Schema({
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  metrics: {
    totalVolunteers: Number,
    activeProjects: Number,
    fundsRaised: Number,
    beneficiariesServed: Number,
    formSubmissions: Number,
    chatMessages: Number
  },
  insights: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = {
  Form: mongoose.model('Form', formSchema),
  Response: mongoose.model('Response', responseSchema),
  Analytics: mongoose.model('Analytics', analyticsSchema)
};