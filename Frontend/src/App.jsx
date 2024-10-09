import { useState } from 'react';
import { SelectPicker } from 'rsuite';
import axios from 'axios';
import DataDisplay from './DataDisplay';
import './App.css';
import 'rsuite/dist/rsuite-no-reset.min.css';

function App() {
  const [region, setRegion] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const handleRegionChange = async (selectedRegion) => { // Accept selected value directly
    if (!selectedRegion) {
      return;
    }
    const regionLowerCase = selectedRegion.toLowerCase(); 
    setRegion(regionLowerCase);

    // Fetch data when the region changes
    if (regionLowerCase) {
      try {
        const endpoint = `${regionLowerCase}/data`; // Unified endpoint
        const response = await axios.get(`http://localhost:5000/api/read/${endpoint}`);
        setData(response.data);
        setError('');
      } catch (err) {
        setError('Error fetching data: ' + err.message);
      }
    } else {
      setError('Please select a region');
    }
  };

  const deletePlayer = async (playerId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/delete/${region}/${playerId}`);
      const result = await response.data;

      if (response.status === 200) {
        // Update the state to remove the deleted player
        setData(prevData => ({
          ...prevData,
          players: prevData.players.filter(player => player._id !== playerId),
        }));
      } else {
        console.error('Failed to delete player:', result.message);
      }
    } catch (error) {
      console.error('Error during player deletion:', error);
    }
  };

  const addRandomPlayer = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/api/create/${region}`);
      const result = await response.data;

      if (response.status === 201) {
        handleRegionChange(region); // Refresh the data
      } else {
        console.error('Failed to add player:', result.message);
      }
    } catch (error) {
      console.error('Error during player addition:', error);
    }
  };

  return (
    <div className="container">
      <h2>Data Intensive Systems - Assignment 4</h2>
      <SelectPicker
        data={[
          { label: 'North America', value: 'NA' },
          { label: 'Europe', value: 'EU' },
          { label: 'Asia', value: 'ASIA' },
          { label: 'Global', value: 'GLOBAL' },
        ]}
        placeholder='Select region'
        onChange={handleRegionChange}
        style={{ width: 224 }}
        searchable={false}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && <DataDisplay data={data} onDeletePlayer={deletePlayer} onAddRandomPlayer={addRandomPlayer} region={region} />}
    </div>
  );
}

export default App;
