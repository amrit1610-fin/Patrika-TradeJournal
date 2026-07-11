const express = require('express');
const cors = require('cors');
const path = require('path'); // NEW: Required to resolve file paths
require('dotenv').config();

const tradesRouter = require('./routes/trades');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS is still useful if you run the frontend separately during local development
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 1. Your API Routes
app.use('/api/trades', tradesRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Patrika API is running' });
});

// 2. Serve static frontend files (NEW FOR RENDER)
// This tells Express to serve the compiled Vite files from the 'dist' folder
app.use(express.static(path.join(__dirname, '../dist')));

// 3. Catch-all route for React Router (NEW FOR RENDER)
// Must be placed AFTER all API routes. This ensures that if a user refreshes 
// the page, Express hands the routing back to your React frontend.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// 4. Start the server
app.listen(PORT, () => {
  console.log(`🚀 Patrika API running on port ${PORT}`);
});