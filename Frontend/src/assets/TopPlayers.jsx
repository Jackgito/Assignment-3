import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const TopPlayers = ({ location }) => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/top-players?location=${location}`);
        const data = await response.json();
        setPlayers(data.players);
      } catch (error) {
        console.error('Error fetching top players:', error);
      }
    };

    fetchTopPlayers();
  }, [location]);

  return (
    <div>
      <h2>Top Players in {location}</h2>
      <ul>
        {players.map(player => (
          <li key={player._id}>
            {player.name} - Score: {player.score} - Rank: {player.rank.rank_name} - Region: {player.region}
          </li>
        ))}
      </ul>
    </div>
  );
};

TopPlayers.propTypes = {
  location: PropTypes.string.isRequired,
};

export default TopPlayers;