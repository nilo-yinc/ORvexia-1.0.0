import { useState, useEffect } from 'react';

const useExample = (initialValue = null) => {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Example effect logic
    console.log('useExample hook initialized');
  }, []);

  return { data, setData, loading, error };
};

export default useExample;
