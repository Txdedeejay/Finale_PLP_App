// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db'); // your DB connection
const path = require('path');

const app = express();

// -------------------------
// Middleware
// -------------------------
app.use(express.json());

// CORS configuration using ALLOWED_ORIGINS env var
// ALLOWED_ORIGINS can be a comma-separated list. Supports wildcard entries like '*.vercel.app'
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || 'http://localhost:5173';
const allowedOrigins = allowedOriginsEnv.split(',').map(s => s.trim()).filter(Boolean);

function isOriginAllowed(origin) {
  // Allow non-browser requests (curl, server-to-server) with no origin
  if (!origin) return true;
  if (allowedOrigins.includes('*')) return true;
  if (allowedOrigins.includes(origin)) return true;
  // support wildcard entries like '*.vercel.app'
  for (const entry of allowedOrigins) {
    if (entry.startsWith('*.') && origin.endsWith(entry.slice(1))) return true;
  }
  return false;
}

app.use(cors({
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) return callback(null, true);
    const msg = `CORS policy: origin '${origin}' is not allowed. Allowed: ${allowedOriginsEnv}`;
    return callback(new Error(msg), false);
  },
  credentials: true,
}));

connectDB().catch(err => console.error('DB connection error:', err));

// log configured allowed origins for debugging (safe to show in logs)
console.log('Configured ALLOWED_ORIGINS:', allowedOrigins);

// Serve uploaded files statically from /uploads
// ensures uploaded files (saved to backend/uploads) are accessible via /uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -------------------------
// Routes (mount available routes)
// -------------------------
// Note: in development we mount routes without auth to allow easy testing.
const authRoutes = require('./routes/auth');
const projectsRoutes = require('./routes/projects');
const ngosRoutes = require('./routes/ngos');
const chatRoutes = require('./routes/chat');
const dataRoutes = require('./routes/data');
const eventsRoutes = require('./routes/events');
const fileRoutes = require('./routes/file');
const groupRoutes = require('./routes/group');
const uploadRoutes = require('./routes/upload');
const volunteersRoutes = require('./routes/volunteers');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/ngos', ngosRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/file', fileRoutes);
app.use('/api/group', groupRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/volunteers', volunteersRoutes);

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// -------------------------
// Fallback for undefined routes
// -------------------------
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// -------------------------
// Start server
// -------------------------
const PORT = process.env.PORT || 5000;
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
const server = app.listen(PORT, HOSTNAME, () => {
  console.log(`✅ Server running on http://${HOSTNAME}:${PORT}`);
  console.log(`✅ Address: ${JSON.stringify(server.address())}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port.`);
  }
  process.exit(1);
});
