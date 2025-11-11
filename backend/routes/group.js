const express = require('express');
const Group = require('../models/Group');
const User = require('../models/User');
const router = express.Router();

router.post('/create', async (req, res) => {
  const { name, userId } = req.body;
  const group = await Group.create({ name, members: [userId] });
  await User.findByIdAndUpdate(userId, { $push: { groups: group._id } });
  res.json(group);
});

router.post('/join', async (req, res) => {
  const { groupId, userId } = req.body;
  await Group.findByIdAndUpdate(groupId, { $addToSet: { members: userId } });
  await User.findByIdAndUpdate(userId, { $addToSet: { groups: groupId } });
  res.json({ message: 'Joined group' });
});

router.get('/user/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId).populate('groups');
  res.json(user.groups);
});

module.exports = router;