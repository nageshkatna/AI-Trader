import axiosInstance from '../axios';
import type {
  ChatRequest,
  ChatResponse,
  HistoricalDataRequest,
  HistoricalDataResponse,
  LivePriceResponse,
  IndicatorRequest,
  IndicatorResponse,
  GenerateStrategyRequest,
  GenerateStrategyResponse,
  BacktestRequest,
  BacktestResponse,
  TradeLogRequest,
  TradeLogResponse,
  ManualTradeLog,
} from './types';

// ========== Chat API ==========
export const chatApi = {
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await axiosInstance.post<ChatResponse>('/chat', data);
    return response.data;
  },

  // For streaming responses (to be implemented with EventSource or fetch)
  streamMessage: async (
    data: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onComplete();
          break;
        }
        const chunk = decoder.decode(value);
        onChunk(chunk);
      }
    } catch (error) {
      onError(error as Error);
    }
  },
};

// ========== Market Data API ==========
export const marketDataApi = {
  getHistoricalData: async (
    params: HistoricalDataRequest
  ): Promise<HistoricalDataResponse> => {
    const response = await axiosInstance.get<HistoricalDataResponse>(
      '/market/historical',
      { params }
    );
    return response.data;
  },

  getLivePrice: async (symbol: string): Promise<LivePriceResponse> => {
    const response = await axiosInstance.get<LivePriceResponse>(
      `/market/price/${symbol}`
    );
    return response.data;
  },

  computeIndicator: async (
    data: IndicatorRequest
  ): Promise<IndicatorResponse> => {
    const response = await axiosInstance.post<IndicatorResponse>(
      '/market/indicator',
      data
    );
    return response.data;
  },
};

// ========== Strategy API ==========
export const strategyApi = {
  generateStrategy: async (
    data: GenerateStrategyRequest
  ): Promise<GenerateStrategyResponse> => {
    const response = await axiosInstance.post<GenerateStrategyResponse>(
      '/strategy/generate',
      data
    );
    return response.data;
  },

  validateStrategy: async (strategy: any): Promise<{ valid: boolean; errors?: string[] }> => {
    const response = await axiosInstance.post('/strategy/validate', strategy);
    return response.data;
  },
};

// ========== Backtest API ==========
export const backtestApi = {
  runBacktest: async (data: BacktestRequest): Promise<BacktestResponse> => {
    const response = await axiosInstance.post<BacktestResponse>(
      '/backtest/run',
      data
    );
    return response.data;
  },

  getBacktest: async (backtestId: string): Promise<BacktestResponse> => {
    const response = await axiosInstance.get<BacktestResponse>(
      `/backtest/${backtestId}`
    );
    return response.data;
  },

  listBacktests: async (): Promise<BacktestResponse[]> => {
    const response = await axiosInstance.get<BacktestResponse[]>('/backtest/list');
    return response.data;
  },
};

// ========== Trade Logging API ==========
export const tradeLogApi = {
  logTrade: async (data: TradeLogRequest): Promise<TradeLogResponse> => {
    const response = await axiosInstance.post<TradeLogResponse>(
      '/trades/log',
      data
    );
    return response.data;
  },

  getTrades: async (status?: 'open' | 'closed'): Promise<ManualTradeLog[]> => {
    const response = await axiosInstance.get<ManualTradeLog[]>('/trades', {
      params: { status },
    });
    return response.data;
  },

  getTrade: async (tradeId: string): Promise<ManualTradeLog> => {
    const response = await axiosInstance.get<ManualTradeLog>(
      `/trades/${tradeId}`
    );
    return response.data;
  },

  updateTrade: async (
    tradeId: string,
    data: Partial<ManualTradeLog>
  ): Promise<TradeLogResponse> => {
    const response = await axiosInstance.patch<TradeLogResponse>(
      `/trades/${tradeId}`,
      data
    );
    return response.data;
  },

  deleteTrade: async (tradeId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<{ message: string }>(
      `/trades/${tradeId}`
    );
    return response.data;
  },
};

// ========== Health Check ==========
export const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await axiosInstance.get('/health');
    return response.data;
  },
};

// Export all APIs as a single object
export const api = {
  chat: chatApi,
  marketData: marketDataApi,
  strategy: strategyApi,
  backtest: backtestApi,
  tradeLog: tradeLogApi,
  health: healthApi,
};

export default api;
