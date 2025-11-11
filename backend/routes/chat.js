const express = require('express');
const { Message, ChatGroup } = require('../models/Chat');
const protect = require('../middleware/auth');

const router = express.Router();

// Get messages for a group
router.get('/:groupId', protect, async (req, res) => {
  try {
    const { groupId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ groupId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      status: 'success',
      results: messages.length,
      data: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send message
router.post('/:groupId', protect, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text } = req.body;

    const message = await Message.create({
      groupId,
      sender: req.user._id,
      text,
      messageType: 'text',
      attachments: []
    });

    await message.populate('sender', 'name avatar');

    // Update last message in group
    await ChatGroup.findByIdAndUpdate(groupId, {
      lastMessage: message._id
    });

    // Emit to socket (handled in socket handler)
    if (req.app.get('io')) {
      req.app.get('io').to(groupId).emit('receiveMessage', message);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Initialize or get chat group for project
router.post('/group/init', protect, async (req, res) => {
  try {
    const { projectId, groupName } = req.body;

    // Look for existing group for this project
    let group = await ChatGroup.findOne({
      projectId: projectId,
      isActive: true
    });

    // If not found, create new group
    if (!group) {
      group = await ChatGroup.create({
        name: groupName || `Project Chat - ${projectId}`,
        projectId: projectId,
        type: 'project',
        participants: [
          { user: req.user._id, role: 'admin' }
        ],
        isActive: true
      });
    }

    await group.populate('participants.user', 'name avatar');

    res.status(201).json({
      _id: group._id,
      groupId: group._id,
      name: group.name,
      type: group.type
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send message (OLD ENDPOINT - for compatibility)
router.post('/', protect, async (req, res) => {
  try {
    const { groupId, text, messageType, attachments } = req.body;

    const message = await Message.create({
      groupId,
      sender: req.user._id,
      text,
      messageType: messageType || 'text',
      attachments: attachments || []
    });

    await message.populate('sender', 'name avatar');

    // Update last message in group
    await ChatGroup.findByIdAndUpdate(groupId, {
      lastMessage: message._id
    });

    // Emit to socket (handled in socket handler)
    if (req.app.get('io')) {
      req.app.get('io').to(groupId).emit('receiveMessage', message);
    }

    res.status(201).json({
      status: 'success',
      data: message
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create chat group
router.post('/groups', protect, async (req, res) => {
  try {
    const { name, description, type, participants } = req.body;

    const group = await ChatGroup.create({
      name,
      description,
      type: type || 'group',
      participants: [
        { user: req.user._id, role: 'admin' },
        ...participants.map(p => ({ user: p, role: 'member' }))
      ]
    });

    await group.populate('participants.user', 'name avatar');

    res.status(201).json({
      status: 'success',
      data: group
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's chat groups
router.get('/groups/my', protect, async (req, res) => {
  try {
    const groups = await ChatGroup.find({
      'participants.user': req.user._id,
      isActive: true
    })
    .populate('participants.user', 'name avatar')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.json({
      status: 'success',
      results: groups.length,
      data: groups
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;