import React, { useState } from 'react';
import { Button } from 'rsuite';

const DataDisplay = ({ data, onDeletePlayer, onAddRandomPlayer, region }) => {
  const [visiblePlayerId, setVisiblePlayerId] = useState(null);

  const toggleDetails = (playerId) => {
    setVisiblePlayerId(visiblePlayerId === playerId ? null : playerId);
  };

  // Show cosmetics, achievements, and friends for a player
  const renderPlayerDetails = (player) => (
    <tr key={`${player._id}-details`}>
      <td colSpan="4">
        <div className="details-section">
          
          <h5>Cosmetics</h5>
          <ul>
          {player.cosmetics && player.cosmetics.length > 0 ? (
            player.cosmetics.map((cosmetic, index) => (
              <li key={index}>{cosmetic}</li>
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
                  {achievement.achievement_name} | {achievement.date_earned}
                </li>
              ))
            ) : (
              <li>No achievements earned</li>
            )}
          </ul>

          <h5>Friends</h5>
          <ul>
            {player.friends && player.friends.length > 0 ? (
              player.friends.map((friend, index) => (
                <li key={index}>{friend}</li>
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
              <Button color="orange" appearance="primary" onClick={() => toggleDetails(player._id)}>
                {visiblePlayerId === player._id ? 'Hide Details' : 'Show Details'}
              </Button>
            </td>
          )}
          <td>
            <Button color="red" appearance="primary" onClick={() => onDeletePlayer(player._id)}>Delete player</Button>
          </td>
        </tr>
        {showDetails && visiblePlayerId === player._id && renderPlayerDetails(player)}
      </React.Fragment>
    ))
  );

  const playersData = data.players || data.topPlayers;
  const showDetails = !!data.players; // Only show details if it's player data (don't show for top players)
  return (
    <div className='container'>
      <h2>{data.players ? 'Player Data' : 'Top Players'}</h2>
      { region != "global" && <Button color="orange" appearance='primary' onClick={() => onAddRandomPlayer()} >Add random player</Button> }
      {playersData.length > 0 ? (
        <table className='data-table'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Score</th>
              <th>Rank</th>
              {showDetails && <th>Actions</th>} {/* Conditional rendering of Actions column */}
            </tr>
          </thead>
          <tbody>
            {renderPlayers(playersData, showDetails)}
          </tbody>
        </table>
      ) : (
        <div>No player data found</div>
      )}
    </div>
  );
};

export default DataDisplay;