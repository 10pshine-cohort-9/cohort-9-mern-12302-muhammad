import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ORIGIN } from '../services/api';

// <audio>/<video> src requests are plain browser fetches and can't carry an
// Authorization header, but our media route requires one. Fetch the file as
// an authenticated blob instead and hand back a local object URL to play.
const useAuthenticatedMedia = (mediaPath) => {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const retry = () => setRetryKey((k) => k + 1);

  useEffect(() => {
    if (!mediaPath) {
      setUrl(null);
      setError(false);
      return undefined;
    }

    let objectUrl = null;
    let cancelled = false;
    setError(false);

    const token = localStorage.getItem('token');
    axios
      .get(`${API_ORIGIN}${mediaPath}`, {
        responseType: 'blob',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data);
        setUrl(objectUrl);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load media:', err);
        setError(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mediaPath, retryKey]);

  return { url, error, retry };
};

export default useAuthenticatedMedia;
