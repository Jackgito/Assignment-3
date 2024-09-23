import React, { useState } from 'react';
import PropTypes from 'prop-types';

const DataDisplay = ({ data }) => {
  const [visiblePlayerId, setVisiblePlayerId] = useState(null);

  const toggleDetails = (playerId) => {
    setVisiblePlayerId(visiblePlayerId === playerId ? null : playerId);
  };

  const renderPlayerDetails = (player) => (
    <tr>
      <td colSpan="4">
        <div className="details-section">
          <h5>Cosmetics</h5>
          <ul>
            {player.cosmetics && player.cosmetics.length > 0 ? (
              player.cosmetics.map(cosmetic => (
                <li key={cosmetic._id}>{cosmetic.name} ({cosmetic.rarity})</li>
              ))
            ) : (
              <li>No cosmetics available</li>
            )}
          </ul>

          <h5>Achievements</h5>
          <ul>
            {player.achievements && player.achievements.length > 0 ? (
              player.achievements.map(achievement => (
                <li key={achievement.id}>
                  {achievement.achievement_name} - {achievement.date_earned}
                </li>
              ))
            ) : (
              <li>No achievements earned</li>
            )}
          </ul>

          <h5>Friends</h5>
          <ul>
            {player.friends && player.friends.length > 0 ? (
              player.friends.map(friend => (
                <li key={friend.friend_id}>{friend.friend_name}</li>
              ))
            ) : (
              <li>No friends found</li>
            )}
          </ul>
        </div>
      </td>
    </tr>
  );

  const renderPlayers = (players, showDetails) => (
    players.map((player) => (
      <React.Fragment key={player._id}>
        <tr>
          <td>{player.name}</td>
          <td>{player.email}</td>
          <td>{player.score}</td>
          <td>{player.rank.rank_name}</td>
          {showDetails && (
            <td>
              <button onClick={() => toggleDetails(player._id)}>
                {visiblePlayerId === player._id ? 'Hide Details' : 'Show Details'}
              </button>
            </td>
          )}
        </tr>
        {showDetails && visiblePlayerId === player._id && renderPlayerDetails(player)}
      </React.Fragment>
    ))
  );

  const playersData = data.players || data.topPlayers;
  const showDetails = !!data.players; // Only show details if it's player data

  if (playersData) {
    return (
      <div className='container'>
        <h2>{data.players ? 'Player Data' : 'Top Players'}</h2>
        <table className='data-table'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Score</th>
              <th>Rank</th>
              {showDetails && <th>Details</th>} {/* Show details column only for player data */}
            </tr>
          </thead>
          <tbody>
            {renderPlayers(playersData, showDetails)}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
};

DataDisplay.propTypes = {
  data: PropTypes.shape({
    players: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        score: PropTypes.number.isRequired,
        rank: PropTypes.shape({
          rank_name: PropTypes.string.isRequired,
        }).isRequired,
        cosmetics: PropTypes.arrayOf(
          PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            rarity: PropTypes.string.isRequired,
          })
        ),
        achievements: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            achievement_name: PropTypes.string.isRequired,
            date_earned: PropTypes.string.isRequired,
          })
        ),
        friends: PropTypes.arrayOf(
          PropTypes.shape({
            friend_id: PropTypes.string.isRequired,
            friend_name: PropTypes.string.isRequired,
          })
        ),
      })
    ),
    topPlayers: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        score: PropTypes.number.isRequired,
        rank: PropTypes.shape({
          rank_name: PropTypes.string.isRequired,
        }).isRequired,
      })
    ),
  }).isRequired,
};

export default DataDisplay;