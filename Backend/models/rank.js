const mongoose = require('mongoose');

const rankSchema = new mongoose.Schema({
  rank_name: { type: String, required: true },
  points_required: { type: Number, required: true },
});

const Rank = mongoose.model('Rank', rankSchema);
module.exports = Rank;