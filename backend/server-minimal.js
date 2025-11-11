require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to DB
connectDB().catch(err => console.error('DB error:', err));

// Simple test routes - no requires
app.get('/api/health', (req, res) => {
  console.log('Health endpoint called!');
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint works' });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Minimal server running on port ${PORT}`);
  console.log(`Server listening: ${server.listening}`);
  console.log(`Server address: ${JSON.stringify(server.address())}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});
