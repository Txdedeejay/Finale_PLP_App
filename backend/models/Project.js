const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, default: 'Active', enum: ['Active', 'Paused', 'Completed'] },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  volunteers: { type: Number, default: 0 },
  budget: { type: Number, default: 0 },
  category: { type: String, default: 'General' },
  deadline: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: [noteSchema],
  invitedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' }],
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  ,
  files: [
    {
      filename: String,
      url: String,
      fileType: String,
      size: Number,
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      uploadedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
