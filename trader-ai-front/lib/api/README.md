# API Client Documentation

## Overview

This directory contains the axios-based API client for communicating with the FastAPI backend.

## Structure

```
lib/api/
├── axios.ts          # Axios instance with interceptors
├── client.ts         # API endpoint functions
├── types.ts          # TypeScript types/interfaces
├── index.ts          # Barrel export
└── README.md         # This file
```

## Configuration

Backend URL is configured via environment variable:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Usage Examples

### Import the API client

```typescript
import { api } from '@/lib/api';
// or import specific APIs
import { chatApi, marketDataApi, strategyApi } from '@/lib/api';
```

### Chat API

```typescript
// Send a message
const response = await api.chat.sendMessage({
  message: "Analyze AAPL stock",
  session_id: "user-123",
});

// Stream responses (for real-time chat)
api.chat.streamMessage(
  { message: "Generate a trading strategy for EURUSD" },
  (chunk) => console.log('Received:', chunk),
  () => console.log('Complete'),
  (error) => console.error('Error:', error)
);
```

### Market Data API

```typescript
// Get historical data
const history = await api.marketData.getHistoricalData({
  symbol: "AAPL",
  timeframe: "1D",
  start_date: "2024-01-01",
  end_date: "2024-12-31",
});

// Get live price
const price = await api.marketData.getLivePrice("AAPL");

// Compute indicator
const indicator = await api.marketData.computeIndicator({
  symbol: "AAPL",
  indicator: "RSI",
  params: { period: 14 },
});
```

### Strategy API

```typescript
// Generate a strategy from natural language
const strategy = await api.strategy.generateStrategy({
  prompt: "Create a momentum trading strategy for EURUSD",
  risk_profile: "moderate",
});

// Validate a strategy
const validation = await api.strategy.validateStrategy(strategyDefinition);
```

### Backtest API

```typescript
// Run a backtest
const backtest = await api.backtest.runBacktest({
  strategy: strategyDefinition,
  start_date: "2023-01-01",
  end_date: "2023-12-31",
  initial_capital: 10000,
});

// Get backtest results
const results = await api.backtest.getBacktest(backtestId);

// List all backtests
const backtests = await api.backtest.listBacktests();
```

### Trade Logging API

```typescript
// Log a manual trade
const trade = await api.tradeLog.logTrade({
  symbol: "AAPL",
  entry_date: "2024-01-15",
  entry_price: 185.50,
  position_size: 100,
  type: "long",
  notes: "Breakout trade",
});

// Get all trades
const trades = await api.tradeLog.getTrades();

// Get open trades only
const openTrades = await api.tradeLog.getTrades('open');

// Update a trade
const updated = await api.tradeLog.updateTrade(tradeId, {
  exit_date: "2024-01-20",
  exit_price: 190.25,
  status: "closed",
});

// Delete a trade
await api.tradeLog.deleteTrade(tradeId);
```

### Health Check

```typescript
const health = await api.health.check();
console.log(health); // { status: "healthy", timestamp: "..." }
```

## Error Handling

The axios instance includes global error handling for common HTTP errors:

```typescript
try {
  const data = await api.marketData.getLivePrice("INVALID");
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
  }
}
```

## Request/Response Logging

In development mode, all requests and responses are automatically logged to the console.

## Interceptors

### Request Interceptor
- Adds authorization headers (when auth is implemented)
- Logs requests in development

### Response Interceptor
- Logs responses in development
- Handles common HTTP errors (401, 403, 404, 500)
- Provides consistent error messages

## TypeScript Support

All API functions are fully typed with TypeScript interfaces from `types.ts`:

```typescript
import type { 
  ChatRequest, 
  HistoricalDataResponse, 
  BacktestMetrics 
} from '@/lib/api';
```

## Extending the API

To add a new endpoint:

1. Add types to `types.ts`
2. Add function to appropriate API object in `client.ts`
3. Export from `index.ts` (if needed)

Example:

```typescript
// types.ts
export interface NewFeatureRequest {
  param: string;
}

// client.ts
export const newFeatureApi = {
  doSomething: async (data: NewFeatureRequest) => {
    const response = await axiosInstance.post('/new-feature', data);
    return response.data;
  },
};
```
