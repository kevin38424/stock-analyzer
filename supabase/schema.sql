create extension if not exists pgcrypto;

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  ticker text not null unique,
  company_name text not null,
  sector text,
  industry text,
  market_cap numeric,
  is_top500 boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stock_metrics_raw (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  pe_ratio numeric,
  pb_ratio numeric,
  ps_ratio numeric,
  ev_ebitda numeric,
  peg_ratio numeric,
  gross_margin numeric,
  net_margin numeric,
  roe numeric,
  roa numeric,
  roic numeric,
  revenue_growth_yoy numeric,
  eps_growth numeric,
  fcf_growth numeric,
  debt_to_equity numeric,
  current_ratio numeric,
  interest_coverage numeric,
  fcf_yield numeric,
  week52_position numeric,
  rsi numeric,
  price_vs_200_day_ma numeric,
  analyst_consensus numeric,
  upgrades_count integer,
  downgrades_count integer,
  price_target_upside numeric,
  news_sentiment numeric,
  insider_buying_score numeric,
  source_provider text,
  fetched_at timestamptz not null default now()
);

create table if not exists stock_scores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  valuation_score numeric not null,
  profitability_score numeric not null,
  growth_score numeric not null,
  financial_health_score numeric not null,
  momentum_score numeric not null,
  sentiment_score numeric not null,
  total_score numeric not null,
  recommendation text not null,
  explanation jsonb not null default '[]'::jsonb,
  calculated_at timestamptz not null default now(),
  unique(company_id)
);

create table if not exists stock_score_history (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  total_score numeric not null,
  calculated_at timestamptz not null default now()
);

create table if not exists user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ticker text not null,
  company_name text not null,
  created_at timestamptz not null default now(),
  unique(user_id, ticker)
);

alter table user_favorites enable row level security;

create policy "users can read own favorites"
  on user_favorites for select
  using (auth.uid() = user_id);

create policy "users can insert own favorites"
  on user_favorites for insert
  with check (auth.uid() = user_id);

create policy "users can delete own favorites"
  on user_favorites for delete
  using (auth.uid() = user_id);

alter table user_favorites
  add column if not exists company_id uuid references companies(id) on delete cascade;

create unique index if not exists idx_user_favorites_user_company_unique
  on user_favorites(user_id, company_id)
  where company_id is not null;

create table if not exists stock_quotes_latest (
  company_id uuid primary key references companies(id) on delete cascade,
  price numeric not null,
  previous_close numeric,
  change_percent numeric,
  market_cap numeric,
  volume bigint,
  source_provider text not null,
  fetched_at timestamptz not null default now()
);

create table if not exists top_stock_rankings_daily (
  id uuid primary key default gen_random_uuid(),
  as_of_date date not null,
  rank integer not null,
  company_id uuid not null references companies(id) on delete cascade,
  total_score numeric not null,
  recommendation text not null,
  delta_score numeric,
  unique(as_of_date, rank),
  unique(as_of_date, company_id)
);

create index if not exists idx_top_stock_rankings_daily_date_rank
  on top_stock_rankings_daily(as_of_date desc, rank asc);

create table if not exists market_daily_summary (
  as_of_date date primary key,
  stocks_analyzed integer not null,
  stocks_analyzed_delta integer not null default 0,
  strong_buys integer not null,
  strong_buys_percent numeric not null,
  average_score numeric not null,
  most_improved_company_id uuid references companies(id) on delete set null,
  most_improved_delta_score numeric,
  watchlist_alerts_count integer not null default 0,
  generated_at timestamptz not null default now()
);

create table if not exists sector_performance_daily (
  id uuid primary key default gen_random_uuid(),
  as_of_date date not null,
  sector text not null,
  change_percent numeric not null,
  rank integer not null,
  unique(as_of_date, sector)
);

create index if not exists idx_sector_performance_daily_date_rank
  on sector_performance_daily(as_of_date desc, rank asc);

create table if not exists score_distribution_daily (
  id uuid primary key default gen_random_uuid(),
  as_of_date date not null,
  bin_start integer not null,
  bin_end integer not null,
  count integer not null,
  unique(as_of_date, bin_start, bin_end)
);

create index if not exists idx_score_distribution_daily_date_bin
  on score_distribution_daily(as_of_date desc, bin_start asc);

create table if not exists user_watchlist_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  company_id uuid not null references companies(id) on delete cascade,
  alert_type text not null,
  severity text not null default 'medium',
  message text not null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists idx_user_watchlist_alerts_user_created
  on user_watchlist_alerts(user_id, created_at desc);

alter table user_watchlist_alerts enable row level security;

create policy "users can read own watchlist alerts"
  on user_watchlist_alerts for select
  using (auth.uid() = user_id);

create policy "users can update own watchlist alerts"
  on user_watchlist_alerts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Stock details page data model (deep-dive page, API-first shape)
alter table companies
  add column if not exists exchange text,
  add column if not exists country text,
  add column if not exists headquarters text,
  add column if not exists cik text,
  add column if not exists logo_url text;

create table if not exists company_profiles (
  company_id uuid primary key references companies(id) on delete cascade,
  website text,
  description text,
  ceo text,
  employee_count integer,
  fiscal_year_end text,
  currency text not null default 'USD',
  updated_at timestamptz not null default now()
);

create table if not exists stock_price_history_daily (
  company_id uuid not null references companies(id) on delete cascade,
  trading_date date not null,
  open numeric not null,
  high numeric not null,
  low numeric not null,
  close numeric not null,
  adjusted_close numeric,
  volume bigint,
  source_provider text not null,
  fetched_at timestamptz not null default now(),
  primary key (company_id, trading_date)
);

create index if not exists idx_stock_price_history_daily_date
  on stock_price_history_daily(trading_date desc);

create table if not exists stock_technicals_daily (
  company_id uuid not null references companies(id) on delete cascade,
  trading_date date not null,
  sma_50 numeric,
  sma_200 numeric,
  rsi_14 numeric,
  week52_position numeric,
  price_vs_200_day_ma numeric,
  primary key (company_id, trading_date)
);

create table if not exists stock_scores_daily (
  company_id uuid not null references companies(id) on delete cascade,
  trading_date date not null,
  valuation_score numeric not null,
  profitability_score numeric not null,
  growth_score numeric not null,
  health_score numeric not null,
  momentum_score numeric not null,
  total_score numeric not null,
  recommendation text not null,
  explanation jsonb not null default '[]'::jsonb,
  calculated_at timestamptz not null default now(),
  primary key (company_id, trading_date)
);

create index if not exists idx_stock_scores_daily_date_total
  on stock_scores_daily(trading_date desc, total_score desc);

create table if not exists financial_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  period_type text not null check (period_type in ('TTM', 'ANNUAL', 'QUARTERLY')),
  period_end date not null,
  pe_ratio numeric,
  ev_ebitda numeric,
  price_to_sales numeric,
  gross_margin numeric,
  net_margin numeric,
  roe numeric,
  revenue_growth_3y numeric,
  eps_growth_3y numeric,
  fcf_growth_3y numeric,
  source_provider text not null,
  fetched_at timestamptz not null default now(),
  unique (company_id, period_type, period_end)
);

create index if not exists idx_financial_metric_snapshots_company_period
  on financial_metric_snapshots(company_id, period_end desc);

create table if not exists analyst_consensus_snapshots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  as_of_date date not null,
  buy_count integer,
  hold_count integer,
  sell_count integer,
  analyst_count integer,
  target_high numeric,
  target_median numeric,
  target_low numeric,
  recommendation text,
  source_provider text not null,
  fetched_at timestamptz not null default now(),
  unique (company_id, as_of_date)
);

create index if not exists idx_analyst_consensus_company_date
  on analyst_consensus_snapshots(company_id, as_of_date desc);

create table if not exists insider_transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  insider_name text not null,
  insider_role text,
  transaction_date date not null,
  transaction_type text not null,
  shares numeric,
  price numeric,
  value_usd numeric,
  source_provider text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_insider_transactions_company_date
  on insider_transactions(company_id, transaction_date desc);

create table if not exists company_news (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  external_id text,
  kind text not null,
  title text not null,
  summary text,
  url text,
  image_url text,
  source_name text,
  sentiment_score numeric,
  published_at timestamptz not null,
  fetched_at timestamptz not null default now(),
  unique (company_id, external_id)
);

create index if not exists idx_company_news_company_published
  on company_news(company_id, published_at desc);

create table if not exists stock_highlights_daily (
  company_id uuid not null references companies(id) on delete cascade,
  as_of_date date not null,
  attractive_points jsonb not null default '[]'::jsonb,
  risk_points jsonb not null default '[]'::jsonb,
  generated_by text not null default 'rules',
  created_at timestamptz not null default now(),
  primary key (company_id, as_of_date)
);
