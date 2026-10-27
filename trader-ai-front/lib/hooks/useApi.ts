import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

// Generic API hook for handling loading, error, and data states
export function useApi<T, P extends any[] = []>(
  apiFunction: (...args: P) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : 'An unknown error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

// Example usage:
// const { data, loading, error, execute } = useApi(api.marketData.getLivePrice);
// await execute('AAPL');
