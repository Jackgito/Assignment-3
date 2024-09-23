const express = require('express');
const router = express.Router();
const Player = require('../models/player');
const { Pool } = require('pg');

// Initialize PostgreSQL pool for NA and ASIA databases
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.ASIA_PG_NAME,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Global Top 3 Route
router.get('/top3', async (req, res) => {
  try {
    // Fetch top players from MongoDB (EU)
    const playersEU = await Player.find().populate('rank').sort({ score: -1 }).limit(3);

    // Fetch top players from PostgreSQL (ASIA)
    const playersASIAResult = await pool.query(`
      SELECT p.id, p.name, p.email, p.score, r.id AS rank_id, r.rank_name
      FROM players p
      JOIN ranks r ON p.rank_id = r.id
      ORDER BY p.score DESC
      LIMIT 3
    `);

    // Fetch top players from PostgreSQL (NA)
    const playersNAResult = await pool.query(`
      SELECT p.id, p.name, p.email, p.score, r.id AS rank_id, r.rank_name
      FROM players p
      JOIN ranks r ON p.rank_id = r.id
      ORDER BY p.score DESC
      LIMIT 3
    `);

    const uniquePlayers = new Map(); // To keep track of unique players

    // Helper function to add players to the map
    const addPlayers = (players, region) => {
      players.forEach(player => {
        if (!uniquePlayers.has(player.name)) {
          uniquePlayers.set(player.name, {
            _id: player._id || player.id, // Use MongoDB _id or PostgreSQL id
            name: player.name,
            email: player.email,
            score: player.score,
            rank: {
              _id: player.rank ? player.rank._id : player.rank_id,
              rank_name: player.rank ? player.rank.rank_name : player.rank_name,
              points_required: player.rank ? player.rank.points_required : null // Adjust as necessary
            },
            region: region
          });
        }
      });
    };

    // Add players from each region
    addPlayers(playersEU, 'EU');
    addPlayers(playersASIAResult.rows, 'ASIA');
    addPlayers(playersNAResult.rows, 'NA');

    // Convert map to array
    const topPlayers = Array.from(uniquePlayers.values());

    // Sort by score and return top 3 globally
    const globalTop3 = topPlayers.sort((a, b) => b.score - a.score).slice(0, 3);
    console.log(globalTop3);
    res.json({ topPlayers: globalTop3 });
  } catch (err) {
    console.error('Error fetching global top 3:', err);
    res.status(500).json({ message: 'Error fetching global top 3' });
  }
});

module.exports = router;