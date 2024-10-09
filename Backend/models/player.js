const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Rank schema to be embedded in the Player schema
const RankSchema = new Schema({
  rank_name: { type: String, required: true },
  points_required: { type: Number, required: true }
});

// Define Achievement schema to be embedded in the Player schema
const AchievementSchema = new Schema({
  achievement_name: { type: String, required: true },
  condition: { type: String, required: true }, // New condition field for achievements
  date_earned: { type: Date, required: true }
});

// Define Friend schema for embedding an array of friends in the Player schema
const FriendSchema = new Schema({
  friend_id: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  name: { type: String, required: true }
});

// Define Player schema
const PlayerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  score: { type: Number, required: true },
  rank: RankSchema,
  achievements: [AchievementSchema],
  friends: [FriendSchema],
  cosmetics: [{ type: String }]
});

const Player = mongoose.model('Player', PlayerSchema);

module.exports = Player;