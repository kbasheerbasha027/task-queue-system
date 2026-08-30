import { useCallback, useEffect, useRef, useState } from 'react';

export function usePolling(fetcher, intervalMs = 5000, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mountedRef = useRef(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const result = await fetcher();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Unable to load data.');
    } finally {
      if (mountedRef.current && !silent) setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    mountedRef.current = true;
    load(false);

    const intervalId = window.setInterval(() => load(true), intervalMs);

    const onRefresh = () => load(true);
    window.addEventListener('queue-refresh', onRefresh);

    return () => {
      mountedRef.current = false;
      window.clearInterval(intervalId);
      window.removeEventListener('queue-refresh', onRefresh);
    };
  }, [load, intervalMs]);

  return { data, loading, error, reload: () => load(false) };
}
