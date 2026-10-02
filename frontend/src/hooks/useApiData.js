import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useApiData(path, initialData) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    api.get(path)
      .then((response) => {
        if (active) setData(response.data.data);
      })
      .catch(() => {
        if (active) setError('Could not load data from the database.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [path, refreshKey]);

  return { data, loading, error, reload: () => setRefreshKey((key) => key + 1) };
}