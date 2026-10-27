"""Market data endpoints"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import yfinance as yf
import pandas as pd

router = APIRouter()


class OHLCV(BaseModel):
    """OHLCV data point"""
    timestamp: str
    open: float
    high: float
    low: float
    close: float
    volume: float


class HistoricalDataResponse(BaseModel):
    """Historical market data response"""
    symbol: str
    timeframe: str
    data: List[OHLCV]


class LivePriceResponse(BaseModel):
    """Live price response"""
    symbol: str
    price: float
    timestamp: str


class IndicatorRequest(BaseModel):
    """Indicator computation request"""
    symbol: str
    indicator: str
    params: Optional[Dict[str, Any]] = None


class IndicatorResponse(BaseModel):
    """Indicator computation response"""
    symbol: str
    indicator: str
    data: Dict[str, Any]


@router.get("/historical", response_model=HistoricalDataResponse)
async def get_historical_data(
    symbol: str = Query(..., description="Trading symbol (e.g., AAPL, EURUSD)"),
    timeframe: str = Query("1d", description="Timeframe (e.g., 1d, 1h, 5m)"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
):
    """
    Get historical OHLCV data for a symbol
    
    Uses yfinance for stock data
    """
    try:
        # Default date range if not provided
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
        
        # Fetch data from yfinance
        ticker = yf.Ticker(symbol)
        df = ticker.history(start=start_date, end=end_date, interval=timeframe)
        
        if df.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No data found for {symbol}"
            )
        
        # Convert to OHLCV format
        ohlcv_data = []
        for timestamp, row in df.iterrows():
            ohlcv_data.append(OHLCV(
                timestamp=timestamp.isoformat(),
                open=float(row['Open']),
                high=float(row['High']),
                low=float(row['Low']),
                close=float(row['Close']),
                volume=float(row['Volume']),
            ))
        
        return HistoricalDataResponse(
            symbol=symbol,
            timeframe=timeframe,
            data=ohlcv_data,
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching market data: {str(e)}"
        )


@router.get("/price/{symbol}", response_model=LivePriceResponse)
async def get_live_price(symbol: str):
    """
    Get current live price for a symbol
    """
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        # Try different price fields
        price = info.get('currentPrice') or info.get('regularMarketPrice') or info.get('previousClose')
        
        if price is None:
            # Fallback: get latest close from history
            df = ticker.history(period="1d")
            if not df.empty:
                price = float(df['Close'].iloc[-1])
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"No price data found for {symbol}"
                )
        
        return LivePriceResponse(
            symbol=symbol,
            price=float(price),
            timestamp=datetime.utcnow().isoformat(),
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching live price: {str(e)}"
        )


@router.post("/indicator", response_model=IndicatorResponse)
async def compute_indicator(request: IndicatorRequest):
    """
    Compute technical indicator for a symbol
    
    Supported indicators: RSI, MACD, EMA, SMA, ATR, Bollinger Bands
    """
    try:
        import pandas_ta as ta
        
        # Fetch recent data
        ticker = yf.Ticker(request.symbol)
        df = ticker.history(period="1y")  # Get enough data for indicators
        
        if df.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No data found for {request.symbol}"
            )
        
        params = request.params or {}
        indicator_name = request.indicator.upper()
        result = {}
        
        # Compute requested indicator
        if indicator_name == "RSI":
            period = params.get("period", 14)
            df['RSI'] = ta.rsi(df['Close'], length=period)
            result = {
                "values": df['RSI'].dropna().tail(50).to_dict(),
                "current": float(df['RSI'].iloc[-1])
            }
        
        elif indicator_name == "MACD":
            macd = ta.macd(df['Close'])
            result = {
                "macd": macd['MACD_12_26_9'].dropna().tail(50).to_dict(),
                "signal": macd['MACDs_12_26_9'].dropna().tail(50).to_dict(),
                "histogram": macd['MACDh_12_26_9'].dropna().tail(50).to_dict(),
            }
        
        elif indicator_name in ["EMA", "SMA"]:
            period = params.get("period", 20)
            if indicator_name == "EMA":
                df['MA'] = ta.ema(df['Close'], length=period)
            else:
                df['MA'] = ta.sma(df['Close'], length=period)
            result = {
                "values": df['MA'].dropna().tail(50).to_dict(),
                "current": float(df['MA'].iloc[-1])
            }
        
        elif indicator_name == "ATR":
            period = params.get("period", 14)
            df['ATR'] = ta.atr(df['High'], df['Low'], df['Close'], length=period)
            result = {
                "values": df['ATR'].dropna().tail(50).to_dict(),
                "current": float(df['ATR'].iloc[-1])
            }
        
        elif indicator_name == "BBANDS":
            period = params.get("period", 20)
            std = params.get("std", 2)
            bbands = ta.bbands(df['Close'], length=period, std=std)
            result = {
                "upper": bbands[f'BBU_{period}_{std}.0'].dropna().tail(50).to_dict(),
                "middle": bbands[f'BBM_{period}_{std}.0'].dropna().tail(50).to_dict(),
                "lower": bbands[f'BBL_{period}_{std}.0'].dropna().tail(50).to_dict(),
            }
        
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported indicator: {indicator_name}"
            )
        
        return IndicatorResponse(
            symbol=request.symbol,
            indicator=indicator_name,
            data=result,
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error computing indicator: {str(e)}"
        )
