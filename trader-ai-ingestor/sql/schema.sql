-- Cloud ingestion landing tables (Postgres).
-- Bars from yfinance / Alpha Vantage / local MT4 uploader.
-- Headlines from news APIs / MT4 news.dat.

CREATE TABLE IF NOT EXISTS market_bars (
  id            BIGSERIAL PRIMARY KEY,
  symbol        TEXT NOT NULL,
  timeframe     TEXT NOT NULL,
  ts            TIMESTAMPTZ NOT NULL,
  open          NUMERIC NOT NULL,
  high          NUMERIC NOT NULL,
  low           NUMERIC NOT NULL,
  close         NUMERIC NOT NULL,
  volume        NUMERIC NOT NULL DEFAULT 0,
  source        TEXT NOT NULL,
  ingested_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (symbol, timeframe, ts, source)
);

CREATE INDEX IF NOT EXISTS idx_market_bars_symbol_tf_ts
  ON market_bars (symbol, timeframe, ts DESC);

CREATE TABLE IF NOT EXISTS news_headlines (
  id            BIGSERIAL PRIMARY KEY,
  headline      TEXT NOT NULL,
  url           TEXT,
  source        TEXT NOT NULL,
  category      TEXT,
  published_at  TIMESTAMPTZ,
  ingested_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  symbols       TEXT[] DEFAULT '{}',
  raw           JSONB,
  UNIQUE (source, headline, published_at)
);

CREATE INDEX IF NOT EXISTS idx_news_published
  ON news_headlines (published_at DESC);

CREATE TABLE IF NOT EXISTS ingest_runs (
  id            BIGSERIAL PRIMARY KEY,
  job           TEXT NOT NULL,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at   TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'running',
  rows_written  INTEGER DEFAULT 0,
  error         TEXT
);
