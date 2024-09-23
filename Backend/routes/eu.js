const express = require('express');
const router = express.Router();
const Player = require('../models/player'); // Adjust the path as necessary
const Cosmetic = require('../models/cosmetic');
const Rank = require('../models/rank'); // Import Rank model
const Achievement = require('../models/achievement'); // Import Achievement model
const Friend = require('../models/friend'); // Import Friend model

// GET EU player data
router.get('/data', async (req, res) => {
  try {
    // Fetch players from MongoDB and populate the rank field
    const players = await Player.find().populate('rank', 'rank_name points_required');
    
    // Fetch cosmetics from MongoDB
    const cosmetics = await Cosmetic.find(); 
    
    // Fetch achievements from MongoDB
    const achievements = await Achievement.find();
    console.log(cosmetics[0].player_id);
    
    // Fetch friends from MongoDB
    const friends = await Friend.find().populate('player_id_1 player_id_2', 'name');

    // Map players to include rank, cosmetics, achievements, and friends
    const formattedPlayers = players.map(player => ({
      _id: player._id,
      name: player.name,
      email: player.email,
      score: player.score,
      rank: {
        rank_name: player.rank.rank_name,
        points_required: player.rank.points_required,
      },
      // Assign cosmetics to players
      cosmetics: cosmetics.filter(cosmetic => String(cosmetic.player_id) === String(player._id)),
      
      // Assign achievements to players and format date_earned
      achievements: achievements
        .filter(achievement => String(achievement.player) === String(player._id))
        .map(achievement => ({
          ...achievement._doc, // Include all achievement fields
          date_earned: new Date(achievement.date_earned).toISOString().split('T')[0] // Format date
        })),
      
      // Assign friends to players
      friends: friends
        .filter(friend => 
          String(friend.player_id_1._id) === String(player._id) || 
          String(friend.player_id_2._id) === String(player._id))
        .map(friend => ({
          friend_name: String(friend.player_id_1._id) === String(player._id) ? friend.player_id_2.name : friend.player_id_1.name
        })),
    }));

    // Return the players with cosmetics, achievements, and friends
    res.json({ players: formattedPlayers });
  } catch (err) {
    console.error('Error fetching EU data:', err);
    res.status(500).json({ message: 'Error fetching EU data' });
  }
});

module.exports = router;