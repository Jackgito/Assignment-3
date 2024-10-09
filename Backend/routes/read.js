const express = require('express');
const router = express.Router();
const Player = require('../models/player');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

// Helper function to create a new Postgres pool based on the region
const createPoolForRegion = (region) => {
  const database = region === 'na' ? process.env.NA_PG_NAME : process.env.ASIA_PG_NAME;
  return new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: database,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
};

// Helper function to fetch players from MongoDB
const fetchPlayersFromMongoDB = async () => {
  const players = await Player.find().populate('rank', 'rank_name points_required');
  return players;
};

// Helper function to fetch player data from Postgres
const fetchPlayersFromPostgres = async (pool) => {
  const playersResult = await pool.query(`
    SELECT p.id, p.name, p.email, p.score, r.id AS rank_id, r.rank_name, r.points_required
    FROM players p
    JOIN ranks r ON p.rank_id = r.id
  `);
  return playersResult.rows;
};

// Helper function to fetch other relevant data from Postgres
const fetchPostgresRelatedData = async (pool) => {
  const cosmeticsResult = await pool.query('SELECT * FROM cosmetics');
  const achievementsResult = await pool.query('SELECT * FROM achievements');
  const friendsResult = await pool.query(`
    SELECT f.id, f.player_id_1, f.player_id_2, 
           p1.name AS player1_name, 
           p2.name AS player2_name
    FROM friends f
    LEFT JOIN players p1 ON f.player_id_1 = p1.id
    LEFT JOIN players p2 ON f.player_id_2 = p2.id
  `);
  
  return { cosmetics: cosmeticsResult.rows, achievements: achievementsResult.rows, friends: friendsResult.rows };
};

// Helper function to format player data from Postgres
const formatPostgresPlayerData = (player, cosmetics, achievements, friends) => ({
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
  cosmetics: cosmetics
    .filter(cosmetic => cosmetic.player_id === player.id)
    .map(cosmetic => cosmetic.items).flat(),
  achievements: achievements
    .filter(achievement => achievement.player_id === player.id)
    .map(achievement => ({
      ...achievement,
      date_earned: new Date(achievement.date_earned).toISOString().split('T')[0],
    })),
  friends: friends
    .filter(friend => friend.player_id_1 === player.id || friend.player_id_2 === player.id)
    .map(friend => {
      const friend_name = friend.player_id_1 === player.id
        ? friend.player2_name || "Deleted player"
        : friend.player1_name || "Deleted player";

      return friend_name;
    }),
});

const fetchDataForRegion = async (region) => {
  if (region === 'eu') {
    // Fetch players and related data from MongoDB
    const players = await fetchPlayersFromMongoDB();
    return players.map(player => ({
      ...player.toObject(),
      friends: player.friends.map(friend => friend.name)
    }));
  } else if (region === 'na' || region === 'asia') {
    // Create a new pool for the specified region
    const pool = createPoolForRegion(region);
    
    // Fetch player data from Postgres
    const players = await fetchPlayersFromPostgres(pool);
    
    // Fetch cosmetics, achievements, and friends from Postgres
    const { cosmetics, achievements, friends } = await fetchPostgresRelatedData(pool);

    return players.map(player => formatPostgresPlayerData(player, cosmetics, achievements, friends));
  } else if (region === 'global') {
    // Fetch players from both MongoDB and Postgres
    const mongoPlayers = await fetchPlayersFromMongoDB(); // Fetch from MongoDB
    const naPool = createPoolForRegion('na');
    const asiaPool = createPoolForRegion('asia');

    // Fetch players from NA region
    const naPlayers = await fetchPlayersFromPostgres(naPool);
    // Fetch players from Asia region
    const asiaPlayers = await fetchPlayersFromPostgres(asiaPool);

    // Fetch cosmetics, achievements, and friends for NA region
    const { cosmetics: naCosmetics, achievements: naAchievements, friends: naFriends } = await fetchPostgresRelatedData(naPool);
    // Fetch cosmetics, achievements, and friends for Asia region
    const { cosmetics: asiaCosmetics, achievements: asiaAchievements, friends: asiaFriends } = await fetchPostgresRelatedData(asiaPool);

    // Format NA players
    const formattedNAPlayers = naPlayers.map(player => formatPostgresPlayerData(player, naCosmetics, naAchievements, naFriends));
    // Format Asia players
    const formattedAsiaPlayers = asiaPlayers.map(player => formatPostgresPlayerData(player, asiaCosmetics, asiaAchievements, asiaFriends));

    // Combine all players
    const formattedMongoPlayers = mongoPlayers.map(player => ({
      ...player.toObject(),
      friends: player.friends.map(friend => friend.name)
    }));

    return [...formattedMongoPlayers, ...formattedNAPlayers, ...formattedAsiaPlayers];
  } else {
    throw new Error('Invalid region specified');
  }
};

// GET data for specified region
router.get('/:region/data', async (req, res) => {
  const { region } = req.params;

  try {
    const players = await fetchDataForRegion(region);
    res.json({ players });
  } catch (err) {
    console.error(`Error fetching ${region} data:`, err);
    res.status(500).json({ message: `Error fetching ${region} data: ${err.message}` });
  }
});

module.exports = router;