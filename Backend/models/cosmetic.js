const mongoose = require('mongoose');
const { Schema } = mongoose;

const CosmeticSchema = new Schema({
  name: String,
  category: String,
  rarity: String,
  release_date: Date,
  player_id: { type: Schema.Types.ObjectId, ref: 'Player' },
});

module.exports = mongoose.model('Cosmetic', CosmeticSchema);