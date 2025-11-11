const router = require('express').Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all projects by NGO
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user._id });
    res.json(projects);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get project by ID
router.get('/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===== NOTES ENDPOINTS =====
// Get notes for a project
router.get('/:projectId/notes', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project.notes || []);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add note to project
router.post('/:projectId/notes', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      {
        $push: {
          notes: {
            _id: require('mongoose').Types.ObjectId(),
            content,
            author: req.user._id,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(201).json(project.notes[project.notes.length - 1]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update note
router.put('/:projectId/notes/:noteId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const note = project.notes.find(n => n._id.toString() === req.params.noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.content = content;
    await project.save();
    res.json(note);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete note
router.delete('/:projectId/notes/:noteId', auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      {
        $pull: {
          notes: { _id: req.params.noteId },
        },
      },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===== INVITE ENDPOINTS =====
// Invite volunteer to project
router.post('/:projectId/invite', auth, async (req, res) => {
  try {
    const { volunteerId, volunteerEmail, message } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      {
        $addToSet: { invitedVolunteers: volunteerId },
      },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // TODO: Integrate with Clerk or email service to send actual invitation
    // For now, just log it
    console.log(`Invite sent to ${volunteerEmail} for project ${project.title}`);

    res.json({
      message: 'Invitation sent successfully',
      project: project,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
