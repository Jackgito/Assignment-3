const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.NA_PG_NAME,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

const router = express.Router();

// Endpoint to get NA data
router.get('/data', async (req, res) => {
  try {
    // Fetch player data and related ranks
    const playersResult = await pool.query(`
      SELECT p.id, p.name, p.email, p.score, r.id AS rank_id, r.rank_name, r.points_required
      FROM players p
      JOIN ranks r ON p.rank_id = r.id
    `);

    // Fetch cosmetics, achievements, and friends
    const cosmeticsResult = await pool.query('SELECT * FROM cosmetics');
    const achievementsResult = await pool.query('SELECT * FROM achievements');
    const friendsResult = await pool.query(`
      SELECT f.id, f.player_id_1, f.player_id_2, 
             p1.name AS player1_name, 
             p2.name AS player2_name
      FROM friends f
      JOIN players p1 ON f.player_id_1 = p1.id
      JOIN players p2 ON f.player_id_2 = p2.id
    `);

    // Format players data with cosmetics, achievements, and friends
    const players = playersResult.rows.map(player => ({
      _id: player.id,
      name: player.name,
      email: player.email,
      score: player.score,
      rank: {
        _id: player.rank_id,
        rank_name: player.rank_name,
        points_required: player.points_required,
        __v: 0,
      },
      // Match cosmetics to each player
      cosmetics: cosmeticsResult.rows.filter(cosmetic => cosmetic.player_id === player.id),
      // Match achievements to each player and format the date to YYYY-MM-DD
      achievements: achievementsResult.rows
        .filter(achievement => achievement.player_id === player.id)
        .map(achievement => ({
          ...achievement,
          date_earned: new Date(achievement.date_earned).toISOString().split('T')[0], // Format date to 'YYYY-MM-DD'
        })),
      // Match friends by player_id_1 and player_id_2, replacing IDs with player names
      friends: friendsResult.rows
        .filter(friend => friend.player_id_1 === player.id || friend.player_id_2 === player.id)
        .map(friend => ({
          friend_name: friend.player_id_1 === player.id ? friend.player2_name : friend.player1_name,
        })),
    }));

    res.json({ players });
  } catch (err) {
    console.error('Error fetching NA data:', err);
    res.status(500).json({ message: 'Error fetching NA data' });
  }
});

module.exports = router;