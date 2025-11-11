require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => {
  console.log('Health endpoint called!');
  res.json({ ok: true, timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`TEST Server running on port ${PORT}`);
  console.log(`Server listening:`, server.listening);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

// Keep the server alive
setInterval(() => {
  // console.log('Server still running...');
}, 60000);

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason);
});
