require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB Atlas connected'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

// Middleware
app.use(express.json());

// Serve static HTML from public/


// Start the server
app.listen(port, () => {
  console.log(`🚀 Open http://localhost:${port} in your browser`);
});
