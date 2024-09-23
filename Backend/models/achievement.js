const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  cosmetic: { type: mongoose.Schema.Types.ObjectId, ref: 'Cosmetic' },
  achievement_name: String,
  date_earned: Date,
});

module.exports = mongoose.model('Achievement', AchievementSchema);