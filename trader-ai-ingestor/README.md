# trader-ai-ingestor

Cloud **data ingestion** layer from [ai-trading-plan-v3](../project-files/ai-trading-plan-v3.md).

This repo is **TypeScript + AWS Lambda + EventBridge**. It is not the local MT4 uploader and not the Python analytics/backtest layer.

## What it does

| Piece | Trigger | Job |
| --- | --- | --- |
| `ingestPrices` | EventBridge (weekday close + optional hourly) | Pull OHLCV from Yahoo (`yahoo-finance2`) or Alpha Vantage → `market_bars` |
| `ingestNews` | EventBridge every 30 minutes | Pull news-API headlines → `news_headlines` |
| `ingestPush` | `POST /ingest` | Receive parsed MT4 `.hst` bars / `news.dat` headlines from the local Python uploader |
| `health` | `GET /health` | Postgres connectivity check |

Everything lands in **Postgres**.

## Layout

```
src/
  handlers/     Lambda entrypoints
  providers/    Yahoo, Alpha Vantage, NewsAPI
  db/           pg client + upserts
sql/schema.sql  landing tables
template.yaml   SAM: Lambdas + EventBridge + API Gateway
docker-compose.yml  local Postgres
```

## Local setup

```bash
cp .env.example .env
npm install
docker compose up -d postgres
npx tsc --noEmit
```

Needs [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) to build/invoke Lambdas:

```bash
sam build
sam local invoke IngestPricesFunction --event events/eventbridge-prices.json
sam local start-api
```

Local uploader push (after `sam local start-api`):

```bash
curl -X POST http://127.0.0.1:3000/ingest \
  -H "content-type: application/json" \
  -H "x-ingest-key: change-me" \
  -d '{"kind":"bars","source":"mt4.hst","bars":[{"symbol":"EURUSD","timeframe":"H1","ts":"2026-09-19T12:00:00Z","open":1.11,"high":1.12,"low":1.10,"close":1.115,"volume":1000}]}'
```

## Deploy

```bash
sam deploy --guided \
  --parameter-overrides \
    DatabaseUrl="$DATABASE_URL" \
    IngestApiKey="$INGEST_API_KEY" \
    AlphaVantageApiKey="$ALPHA_VANTAGE_API_KEY" \
    NewsApiKey="$NEWS_API_KEY"
```

Lambda must reach Postgres (VPC + SG, or a public host for early demos). Wire `DATABASE_URL` to Secrets Manager later.

**TODO before deploying:** work through "TODO before deploying — secure the ingest push API" in [ai-trading-plan-v3](../project-files/ai-trading-plan-v3.md). Never deploy with `IngestApiKey=change-me`.

## Out of scope here

- Local Python MT4 `.hst` / `news.dat` parser (separate uploader on the trading PC)
- `pandas-ta` / backtest engine (analytics layer)
- MCP servers in front of this data (Phase 4)
