const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  mission: {
    type: String,
    required: true
  },
  focusAreas: [{
    type: String,
    enum: [
      'Education', 'Healthcare', 'Environment', 'Poverty Alleviation',
      'Human Rights', 'Gender Equality', 'Disaster Relief', 'Animal Welfare',
      'Community Development', 'Youth Empowerment', 'Elderly Care', 'Disability Support'
    ]
  }],
  location: {
    address: String,
    city: String,
    state: String,
    country: String
  },
  contact: {
    email: String,
    phone: String,
    website: String
  },
  size: {
    type: String,
    enum: ['Small', 'Medium', 'Large'],
    default: 'Medium'
  },
  established: Date,
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NGO', ngoSchema);