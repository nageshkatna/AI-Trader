"""Main FastAPI application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from datetime import datetime

from app.config import settings
from app.api.routes import chat, market, strategy, backtest, trades, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for the application"""
    # Startup
    print(f"🚀 Starting {settings.app_name} v{settings.app_version}")
    print(f"📍 Running on {settings.host}:{settings.port}")
    print(f"🔧 Debug mode: {settings.debug}")
    
    yield
    
    # Shutdown
    print("👋 Shutting down gracefully...")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered trading assistant backend with backtesting and strategy generation",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/health", tags=["Health"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(market.router, prefix="/market", tags=["Market Data"])
app.include_router(strategy.router, prefix="/strategy", tags=["Strategy"])
app.include_router(backtest.router, prefix="/backtest", tags=["Backtest"])
app.include_router(trades.router, prefix="/trades", tags=["Trades"])


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "docs_url": "/docs",
        "redoc_url": "/redoc",
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "message": str(exc) if settings.debug else "An internal error occurred",
        }
    )
