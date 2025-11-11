const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatGroup',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    size: Number
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    reactedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const chatGroupSchema = new mongoose.Schema({
  name: String,
  description: String,
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  type: {
    type: String,
    enum: ['direct', 'group', 'project', 'broadcast'],
    default: 'group'
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  settings: {
    allowAttachments: { type: Boolean, default: true },
    allowReactions: { type: Boolean, default: true },
    adminOnlyMessages: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

module.exports = {
  Message: mongoose.model('Message', messageSchema),
  ChatGroup: mongoose.model('ChatGroup', chatGroupSchema)
};