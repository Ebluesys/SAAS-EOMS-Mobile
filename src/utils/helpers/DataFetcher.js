import React, { useEffect, useState } from 'react';

const DataFetcher = ({ url, onDataFetched }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const jsonData = await response.json();
      setData(jsonData);
      onDataFetched(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return null;
};

export default DataFetcher;
