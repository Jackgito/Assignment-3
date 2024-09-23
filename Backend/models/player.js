const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  score: { type: Number, required: true },
  rank: { type: mongoose.Schema.Types.ObjectId, ref: 'Rank' },
});

const Player = mongoose.model('Player', playerSchema);
module.exports = Player;