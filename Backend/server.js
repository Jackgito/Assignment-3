const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const createRoutes = require('./routes/create');
const readRoutes = require('./routes/read');
const deleteRoutes = require('./routes/delete');

const { Pool } = require('pg');

dotenv.config();

const app = express();

// Use CORS middleware
app.use(cors({ origin: 'http://localhost:5173' })); // Allow frontend's origin

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Postgres connection pools for NA and Asia
const NApool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  password: process.env.PG_PASSWORD,
  database: process.env.NA_PG_NAME,
  port: process.env.PG_PORT,
});

const ASIApool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  password: process.env.PG_PASSWORD,
  database: process.env.ASIA_PG_NAME,
  port: process.env.PG_PORT,
});

// Middleware to attach pools to request object
app.use((req, res, next) => {
  req.NApool = NApool;
  req.ASIApool = ASIApool;
  next();
});

// Routes
app.use('/api/create', createRoutes);
app.use('/api/read', readRoutes);
app.use('/api/delete', deleteRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});