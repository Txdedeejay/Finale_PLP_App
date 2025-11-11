const express = require('express');
const multer = require('multer');
const path = require('path');
const protect = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/') || 
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'text/plain') {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Upload file
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileData = {
      filename: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    res.json({
      status: 'success',
      data: fileData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload multiple files
router.post('/multiple', protect, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const filesData = req.files.map(file => ({
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      size: file.size,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    }));

    res.json({
      status: 'success',
      results: filesData.length,
      data: filesData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;