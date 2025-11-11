const express = require('express');
const NGO = require('../models/NGO');

const router = express.Router();

// Get all NGOs
router.get('/', async (req, res) => {
  try {
    const ngos = await NGO.find({ verificationStatus: 'verified' });
    
    res.json({
      status: 'success',
      results: ngos.length,
      data: ngos
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching NGOs'
    });
  }
});

// Create NGO
router.post('/', async (req, res) => {
  try {
    const ngo = await NGO.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: ngo
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating NGO'
    });
  }
});

module.exports = router;