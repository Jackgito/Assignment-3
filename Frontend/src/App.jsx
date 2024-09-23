import { useState } from 'react';
import axios from 'axios';
import DataDisplay from './DataDisplay';
import './App.css'; // Import your CSS file

function App() {
  const [location, setLocation] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const fetchData = async () => {
    try {
      let endpoint = '';
      if (location === 'EU') {
        endpoint = 'eu/data';
      } else if (location === 'ASIA') {
        endpoint = 'asia/data';
      } else if (location === 'NA') {
        endpoint = 'na/data';
      } else if (location === 'TOP3') {
        endpoint = 'top3'; // Assuming you have an endpoint for global top 3
      }

      const response = await axios.get(`http://localhost:5000/api/${endpoint}`);
      setData(response.data);
      setError('');
    } catch (err) {
      setError('Error fetching data: ' + err.message);
    }
  };

  const handleFetchData = () => {
    if (location) {
      fetchData();
    } else {
      setError('Please select a location');
    }
  };

  return (
    <div className="container">
      <h1>Select Region</h1>
      <select value={location} onChange={handleLocationChange}>
        <option value="">Select...</option>
        <option value="NA">North America</option>
        <option value="EU">Europe</option>
        <option value="ASIA">Asia</option>
        <option value="TOP3">Global Top 3</option>
      </select>
      <button onClick={handleFetchData}>Fetch Data</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && <DataDisplay data={data} />}
    </div>
  );
}

export default App;