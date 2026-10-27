// API Request/Response Types

// ========== Chat ==========
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  context?: Record<string, any>;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  timestamp: string;
}

// ========== Market Data ==========
export interface HistoricalDataRequest {
  symbol: string;
  timeframe: string;
  start_date?: string;
  end_date?: string;
}

export interface OHLCV {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalDataResponse {
  symbol: string;
  timeframe: string;
  data: OHLCV[];
}

export interface LivePriceResponse {
  symbol: string;
  price: number;
  timestamp: string;
}

// ========== Indicators ==========
export interface IndicatorRequest {
  symbol: string;
  indicator: string;
  params?: Record<string, any>;
}

export interface IndicatorResponse {
  symbol: string;
  indicator: string;
  data: Record<string, any>;
}

// ========== Strategy ==========
export interface StrategyDefinition {
  symbol: string;
  timeframe: string;
  entry_rules: string;
  exit_rules: string;
  stop_loss?: string;
  take_profit?: string;
  risk_per_trade?: number;
  description?: string;
}

export interface GenerateStrategyRequest {
  prompt: string;
  risk_profile?: 'conservative' | 'moderate' | 'aggressive';
}

export interface GenerateStrategyResponse {
  strategy: StrategyDefinition;
  explanation: string;
}

// ========== Backtest ==========
export interface BacktestRequest {
  strategy: StrategyDefinition;
  start_date: string;
  end_date: string;
  initial_capital?: number;
}

export interface Trade {
  entry_date: string;
  exit_date: string;
  entry_price: number;
  exit_price: number;
  position_size: number;
  pnl: number;
  pnl_percent: number;
  type: 'long' | 'short';
}

export interface BacktestMetrics {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl: number;
  total_pnl_percent: number;
  sharpe_ratio: number;
  max_drawdown: number;
  max_drawdown_percent: number;
  profit_factor: number;
}

export interface BacktestResponse {
  backtest_id: string;
  strategy: StrategyDefinition;
  trades: Trade[];
  metrics: BacktestMetrics;
  equity_curve: Array<{ date: string; value: number }>;
}

// ========== Trade Logging ==========
export interface ManualTradeLog {
  id?: string;
  symbol: string;
  entry_date: string;
  entry_price: number;
  position_size: number;
  type: 'long' | 'short';
  exit_date?: string;
  exit_price?: number;
  pnl?: number;
  notes?: string;
  strategy_id?: string;
  status: 'open' | 'closed';
}

export interface TradeLogRequest {
  symbol: string;
  entry_date: string;
  entry_price: number;
  position_size: number;
  type: 'long' | 'short';
  notes?: string;
  strategy_id?: string;
}

export interface TradeLogResponse {
  trade: ManualTradeLog;
  message: string;
}

// ========== Error Response ==========
export interface ApiError {
  error: string;
  message: string;
  details?: any;
}
