const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  player_id_1: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  player_id_2: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
});

const Friend = mongoose.model('Friend', friendSchema);
module.exports = Friend;