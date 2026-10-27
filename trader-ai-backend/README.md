# AI Trader Backend

FastAPI backend for the AI Trading Intelligence Platform.

## Features

- ✅ **Chat API** - LLM-powered trading assistant
- ✅ **Market Data** - Historical OHLCV data, live prices, technical indicators
- ✅ **Strategy Generation** - Generate and validate trading strategies
- ✅ **Backtesting** - Test strategies on historical data
- ✅ **Trade Logging** - Track manual trades

## Tech Stack

- **FastAPI** - Modern web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **yfinance** - Market data
- **pandas-ta** - Technical indicators
- **SQLAlchemy** - Database ORM (optional)

## Project Structure

```
trader-ai-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuration
│   └── api/
│       └── routes/
│           ├── health.py    # Health check
│           ├── chat.py      # Chat endpoints
│           ├── market.py    # Market data
│           ├── strategy.py  # Strategy generation
│           ├── backtest.py  # Backtesting
│           └── trades.py    # Trade logging
├── requirements.txt
├── .env.example
├── run.py                   # Entry point
└── README.md
```

## Setup

### 1. Create virtual environment

```bash
cd trader-ai-backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Run the server

```bash
# Development mode (with auto-reload)
python run.py

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Health
- `GET /health` - Health check

### Chat
- `POST /chat` - Send message to trading assistant
- `POST /chat/stream` - Stream chat responses (SSE)
- `GET /chat/sessions/{session_id}` - Get chat history

### Market Data
- `GET /market/historical` - Get historical OHLCV data
- `GET /market/price/{symbol}` - Get live price
- `POST /market/indicator` - Compute technical indicator

### Strategy
- `POST /strategy/generate` - Generate strategy from prompt
- `POST /strategy/validate` - Validate strategy definition

### Backtest
- `POST /backtest/run` - Run backtest
- `GET /backtest/{backtest_id}` - Get backtest results
- `GET /backtest/list` - List all backtests

### Trades
- `POST /trades/log` - Log a manual trade
- `GET /trades` - Get all trades
- `GET /trades/{trade_id}` - Get specific trade
- `PATCH /trades/{trade_id}` - Update trade
- `DELETE /trades/{trade_id}` - Delete trade

## Configuration

Edit `.env` file:

```env
# Application
DEBUG=True
HOST=0.0.0.0
PORT=8000

# CORS
FRONTEND_URL=http://localhost:3000

# Database (optional)
DATABASE_URL=sqlite:///./ai_trader.db

# LLM API Keys (add your key)
OPENAI_API_KEY=your_key_here
# ANTHROPIC_API_KEY=your_key_here

# Market Data API Keys
# ALPHA_VANTAGE_API_KEY=your_key_here
```

## Development

### Testing

```bash
pytest
```

### Code formatting

```bash
pip install black isort
black app/
isort app/
```

## TODO / Integration Points

The following are placeholders that need real implementations:

1. **Chat Agent** (`app/api/routes/chat.py`)
   - Integrate with OpenAI, Anthropic, or your LLM provider
   - Implement tool-calling for market analysis

2. **Backtesting Engine** (`app/api/routes/backtest.py`)
   - Build standalone backtesting engine
   - Implement strategy execution logic
   - Calculate proper metrics (Sharpe, drawdown, etc.)

3. **Database** (optional)
   - Set up PostgreSQL or keep SQLite
   - Add Alembic migrations
   - Implement proper models for trades, backtests, sessions

4. **Strategy Validation** (`app/api/routes/strategy.py`)
   - Parse and validate strategy rules
   - Integrate with backtesting engine

5. **Error Handling**
   - Add proper logging (loguru is installed)
   - Implement retry logic for external APIs
   - Add rate limiting

## Deployment

### Docker (recommended)

```bash
# TODO: Add Dockerfile
docker build -t ai-trader-backend .
docker run -p 8000:8000 ai-trader-backend
```

### Traditional

```bash
# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## License

See LICENSE file
