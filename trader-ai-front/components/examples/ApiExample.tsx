'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks/useApi';
import type { LivePriceResponse } from '@/lib/api';

/**
 * Example component demonstrating how to use the API client
 * This can be removed once you implement real components
 */
export default function ApiExample() {
  const [symbol, setSymbol] = useState('AAPL');
  const { data, loading, error, execute } = useApi(api.marketData.getLivePrice);

  const handleFetchPrice = async () => {
    try {
      await execute(symbol);
    } catch (err) {
      console.error('Failed to fetch price:', err);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">API Client Example</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium mb-2">
            Symbol
          </label>
          <input
            id="symbol"
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter symbol (e.g., AAPL)"
          />
        </div>

        <button
          onClick={handleFetchPrice}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Fetch Live Price'}
        </button>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
          </div>
        )}

        {data && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <p className="font-semibold">{data.symbol}</p>
            <p className="text-2xl font-bold">${data.price}</p>
            <p className="text-sm text-gray-600">{data.timestamp}</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded text-sm">
        <p className="font-semibold mb-2">Usage:</p>
        <pre className="bg-gray-800 text-green-400 p-2 rounded overflow-x-auto">
{`import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks/useApi';

const { data, loading, error, execute } 
  = useApi(api.marketData.getLivePrice);

await execute('AAPL');`}
        </pre>
      </div>
    </div>
  );
}
