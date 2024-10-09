const express = require('express');
const router = express.Router();
const Player = require('../models/player'); // MongoDB model for EU

// DELETE route to delete a player
router.delete('/:region/:id', async (req, res) => {
  const { region, id } = req.params;
  const { NApool, ASIApool } = req; // Access the pools from the request object

  try {
    if (region.toLowerCase() === 'eu') {
      // MongoDB (EU) deletion
      const deletedPlayer = await Player.findByIdAndDelete(id);

      if (!deletedPlayer) {
        return res.status(404).json({ message: 'Player not found in EU database' });
      }

      res.status(200).json({
        message: 'Player deleted from EU database',
        player: deletedPlayer,
      });
    } else if (region.toLowerCase() === 'na' || region.toLowerCase() === 'asia') {
      // Use the appropriate PostgreSQL pool for NA or Asia
      const pool = region.toLowerCase() === 'na' ? NApool : ASIApool;

      // Delete related records from friends, cosmetics, and achievements tables
      await pool.query('DELETE FROM friends WHERE player_id_1 = $1 OR player_id_2 = $1', [id]);
      await pool.query('DELETE FROM cosmetics WHERE player_id = $1', [id]);
      await pool.query('DELETE FROM achievements WHERE player_id = $1', [id]);

      // Delete player from Postgres (NA/Asia)
      const result = await pool.query('DELETE FROM players WHERE id = $1 RETURNING *', [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Player not found in NA/Asia database' });
      }

      res.status(200).json({
        message: `Player deleted from ${region.toUpperCase()} database`,
        player: result.rows[0],
      });
    } else {
      res.status(400).json({ message: 'Invalid region' });
    }
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ message: 'Error deleting player', error });
  }
});

module.exports = router;