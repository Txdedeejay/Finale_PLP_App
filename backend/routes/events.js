const router = require('express').Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Schedule event
router.post('/', auth, async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, ngo: req.user._id });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get events for NGO
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find({ ngo: req.user._id });
    res.json(events);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
