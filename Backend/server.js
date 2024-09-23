const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const euRoutes = require('./routes/eu');
const asiaRoutes = require('./routes/asia');
const naRoutes = require('./routes/na');
const topRoutes = require('./routes/top3');

dotenv.config();

// Initialize Express app
const app = express();

// Use CORS middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow frontend's origin
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Use routes
app.use('/api/eu', euRoutes);
app.use('/api/asia', asiaRoutes);
app.use('/api/na', naRoutes);
app.use('/api', topRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});