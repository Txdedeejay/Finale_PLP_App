const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from this backend folder explicitly so running from repo root
// doesn't accidentally load an unrelated top-level .env
dotenv.config({ path: path.resolve(__dirname, '.env') }); // ✅ loads backend/.env

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('Warning: MONGODB_URI is not set in backend/.env');
    } else {
      // Log host portion (redacted) to help debug which URI is being used
      try {
        const uri = process.env.MONGODB_URI;
        const hostMatch = uri.match(/@(.*)\//);
        console.log('Using MongoDB host (redacted):', hostMatch ? `***${hostMatch[1].slice(-20)}` : 'unknown');
      } catch (e) {
        // ignore
      }
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

module.exports = connectDB;
