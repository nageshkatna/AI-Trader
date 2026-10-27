"""Trade logging endpoints for manual trade tracking"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

router = APIRouter()


class ManualTradeLog(BaseModel):
    """Manual trade log entry"""
    id: Optional[str] = None
    symbol: str
    entry_date: str
    entry_price: float
    position_size: float
    type: str  # "long" or "short"
    exit_date: Optional[str] = None
    exit_price: Optional[float] = None
    pnl: Optional[float] = None
    notes: Optional[str] = None
    strategy_id: Optional[str] = None
    status: str = "open"  # "open" or "closed"


class TradeLogRequest(BaseModel):
    """Request to log a new trade"""
    symbol: str
    entry_date: str
    entry_price: float
    position_size: float
    type: str
    notes: Optional[str] = None
    strategy_id: Optional[str] = None


class TradeLogResponse(BaseModel):
    """Trade logging response"""
    trade: ManualTradeLog
    message: str


# In-memory trade storage (replace with database in production)
trades_db: Dict[str, ManualTradeLog] = {}


@router.post("/log", response_model=TradeLogResponse)
async def log_trade(request: TradeLogRequest):
    """
    Log a new manual trade
    
    Used for tracking trades the user manually places with their broker
    """
    trade_id = str(uuid.uuid4())
    
    trade = ManualTradeLog(
        id=trade_id,
        symbol=request.symbol,
        entry_date=request.entry_date,
        entry_price=request.entry_price,
        position_size=request.position_size,
        type=request.type,
        notes=request.notes,
        strategy_id=request.strategy_id,
        status="open"
    )
    
    trades_db[trade_id] = trade
    
    return TradeLogResponse(
        trade=trade,
        message="Trade logged successfully"
    )


@router.get("", response_model=List[ManualTradeLog])
async def get_trades(status: Optional[str] = None):
    """
    Get all trades, optionally filtered by status
    
    Query params:
    - status: Filter by "open" or "closed"
    """
    trades = list(trades_db.values())
    
    if status:
        trades = [t for t in trades if t.status == status]
    
    return trades


@router.get("/{trade_id}", response_model=ManualTradeLog)
async def get_trade(trade_id: str):
    """Get a specific trade by ID"""
    if trade_id not in trades_db:
        raise HTTPException(
            status_code=404,
            detail=f"Trade {trade_id} not found"
        )
    
    return trades_db[trade_id]


@router.patch("/{trade_id}", response_model=TradeLogResponse)
async def update_trade(trade_id: str, updates: Dict[str, Any]):
    """
    Update a trade (e.g., close a position, update exit price)
    """
    if trade_id not in trades_db:
        raise HTTPException(
            status_code=404,
            detail=f"Trade {trade_id} not found"
        )
    
    trade = trades_db[trade_id]
    
    # Update fields
    for field, value in updates.items():
        if hasattr(trade, field):
            setattr(trade, field, value)
    
    # Calculate P&L if closing the trade
    if trade.exit_price and trade.entry_price:
        if trade.type == "long":
            trade.pnl = (trade.exit_price - trade.entry_price) * trade.position_size
        else:  # short
            trade.pnl = (trade.entry_price - trade.exit_price) * trade.position_size
    
    trades_db[trade_id] = trade
    
    return TradeLogResponse(
        trade=trade,
        message="Trade updated successfully"
    )


@router.delete("/{trade_id}")
async def delete_trade(trade_id: str):
    """Delete a trade"""
    if trade_id not in trades_db:
        raise HTTPException(
            status_code=404,
            detail=f"Trade {trade_id} not found"
        )
    
    del trades_db[trade_id]
    
    return {"message": f"Trade {trade_id} deleted successfully"}
