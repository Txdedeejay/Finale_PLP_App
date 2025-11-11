const router = require('express').Router();
const Volunteer = require('../models/Volunteer');
const auth = require('../middleware/auth');

// Add volunteer
router.post('/', auth, async (req, res) => {
  try {
    const volunteer = await Volunteer.create({ ...req.body, ngo: req.user._id });
    res.status(201).json(volunteer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get volunteers for NGO
router.get('/', auth, async (req, res) => {
  try {
    const volunteers = await Volunteer.find({ ngo: req.user._id });
    res.json(volunteers);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Remove volunteer
router.delete('/:id', auth, async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer || volunteer.ngo.toString() !== req.user._id) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    await volunteer.remove();
    res.json({ message: 'Volunteer removed' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
