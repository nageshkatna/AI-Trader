"""Strategy generation and validation endpoints"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter()


class StrategyDefinition(BaseModel):
    """Strategy definition schema"""
    symbol: str
    timeframe: str
    entry_rules: str
    exit_rules: str
    stop_loss: Optional[str] = None
    take_profit: Optional[str] = None
    risk_per_trade: Optional[float] = 0.02
    description: Optional[str] = None


class GenerateStrategyRequest(BaseModel):
    """Request to generate a strategy"""
    prompt: str
    risk_profile: Optional[str] = "moderate"  # conservative, moderate, aggressive


class GenerateStrategyResponse(BaseModel):
    """Generated strategy response"""
    strategy: StrategyDefinition
    explanation: str


class ValidationResponse(BaseModel):
    """Strategy validation response"""
    valid: bool
    errors: Optional[list[str]] = None


@router.post("/generate", response_model=GenerateStrategyResponse)
async def generate_strategy(request: GenerateStrategyRequest):
    """
    Generate a trading strategy from natural language prompt
    
    TODO: Integrate with your LLM agent for strategy generation
    """
    # Placeholder - integrate with your LLM agent here
    strategy = StrategyDefinition(
        symbol="AAPL",
        timeframe="1D",
        entry_rules="RSI < 30 and price above 200 EMA",
        exit_rules="RSI > 70 or price below 200 EMA",
        stop_loss="ATR * 2",
        take_profit="RR 1.5",
        risk_per_trade=0.02,
        description=f"Generated strategy based on: {request.prompt}"
    )
    
    explanation = (
        "This is a placeholder strategy. "
        "Integrate with your LLM agent to generate real strategies based on the prompt."
    )
    
    return GenerateStrategyResponse(
        strategy=strategy,
        explanation=explanation
    )


@router.post("/validate", response_model=ValidationResponse)
async def validate_strategy(strategy: StrategyDefinition):
    """
    Validate a strategy definition
    
    Checks for required fields and logical consistency
    """
    errors = []
    
    # Basic validation
    if not strategy.symbol:
        errors.append("Symbol is required")
    
    if not strategy.timeframe:
        errors.append("Timeframe is required")
    
    if not strategy.entry_rules:
        errors.append("Entry rules are required")
    
    if not strategy.exit_rules:
        errors.append("Exit rules are required")
    
    # Risk validation
    if strategy.risk_per_trade:
        if strategy.risk_per_trade <= 0 or strategy.risk_per_trade > 0.1:
            errors.append("Risk per trade should be between 0 and 10%")
    
    return ValidationResponse(
        valid=len(errors) == 0,
        errors=errors if errors else None
    )
