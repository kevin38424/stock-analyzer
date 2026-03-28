create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'valuation_style_enum') then
    create type valuation_style_enum as enum ('growth', 'value', 'income');
  end if;
  if not exists (select 1 from pg_type where typname = 'watchlist_segment_enum') then
    create type watchlist_segment_enum as enum ('all_holdings', 'tech_growth', 'dividends', 'speculative');
  end if;
  if not exists (select 1 from pg_type where typname = 'subscription_status_enum') then
    create type subscription_status_enum as enum ('trialing', 'active', 'past_due', 'canceled', 'paused', 'incomplete');
  end if;
  if not exists (select 1 from pg_type where typname = 'billing_interval_enum') then
    create type billing_interval_enum as enum ('monthly', 'yearly');
  end if;
  if not exists (select 1 from pg_type where typname = 'recommendation_enum') then
    create type recommendation_enum as enum ('STRONG BUY', 'BUY', 'HOLD', 'WATCH', 'AVOID');
  end if;
end
$$;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Core company identity and reference data
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  ticker text not null unique,
  company_name text not null,
  sector text,
  industry text,
  market_cap numeric,
  is_top500 boolean not null default false,
  exchange text,
  country text,
  headquarters text,
  cik text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_ticker_uppercase_check check (ticker = upper(ticker))
);

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

-- Raw ingest tables (provider payload normalized to columns)
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

create index if not exists idx_stock_metrics_raw_company_fetched
  on stock_metrics_raw(company_id, fetched_at desc);

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

-- Market data canonical tables
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
  primary key (company_id, trading_date),
  constraint stock_price_history_daily_price_check
    check (open > 0 and high > 0 and low > 0 and close > 0 and high >= low)
);

create index if not exists idx_stock_price_history_daily_date
  on stock_price_history_daily(trading_date desc);

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

-- Ingestion orchestration and observability (used by scheduled and websocket workers)
create table if not exists market_data_sync_runs (
  id uuid primary key default gen_random_uuid(),
  run_kind text not null check (run_kind in ('on_demand', 'scheduled', 'stream')),
  provider text not null,
  status text not null check (status in ('started', 'succeeded', 'partial', 'failed')),
  symbol_count integer not null default 0,
  ingested_count integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text
);

create index if not exists idx_market_data_sync_runs_started
  on market_data_sync_runs(started_at desc);

create table if not exists market_stream_state (
  id boolean primary key default true,
  provider text not null default 'tradier',
  status text not null default 'idle' check (status in ('idle', 'connecting', 'streaming', 'reconnecting', 'error')),
  session_id text,
  session_started_at timestamptz,
  session_expires_at timestamptz,
  desired_symbols text[] not null default '{}'::text[],
  active_symbols text[] not null default '{}'::text[],
  last_heartbeat_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint market_stream_state_singleton_check check (id = true)
);

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

-- Scoring and ranking canonical snapshots
create table if not exists stock_scores_daily (
  company_id uuid not null references companies(id) on delete cascade,
  trading_date date not null,
  valuation_score numeric not null,
  profitability_score numeric not null,
  growth_score numeric not null,
  health_score numeric not null,
  momentum_score numeric not null,
  sentiment_score numeric,
  total_score numeric not null,
  recommendation recommendation_enum not null,
  explanation jsonb not null default '[]'::jsonb,
  calculated_at timestamptz not null default now(),
  primary key (company_id, trading_date),
  constraint stock_scores_daily_total_score_range_check
    check (total_score >= 0 and total_score <= 100)
);

create index if not exists idx_stock_scores_daily_date_total
  on stock_scores_daily(trading_date desc, total_score desc);

create table if not exists top_stock_rankings_daily (
  id uuid primary key default gen_random_uuid(),
  as_of_date date not null,
  valuation_style valuation_style_enum not null default 'growth',
  rank integer not null check (rank > 0),
  company_id uuid not null references companies(id) on delete cascade,
  total_score numeric not null check (total_score >= 0 and total_score <= 100),
  recommendation recommendation_enum not null,
  delta_score numeric,
  ranking_source text not null default 'daily_job',
  unique(as_of_date, valuation_style, rank),
  unique(as_of_date, valuation_style, company_id)
);

create index if not exists idx_top_stock_rankings_daily_style_rank
  on top_stock_rankings_daily(as_of_date desc, valuation_style, rank asc);

create table if not exists top_stock_rank_insights_daily (
  as_of_date date not null,
  valuation_style valuation_style_enum not null default 'growth',
  rank integer not null check (rank > 0),
  company_id uuid not null references companies(id) on delete cascade,
  why_it_ranks text not null,
  algorithm_note text,
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  generated_by text not null default 'rules',
  created_at timestamptz not null default now(),
  primary key (as_of_date, valuation_style, rank),
  unique (as_of_date, valuation_style, company_id)
);

create index if not exists idx_top_stock_rank_insights_daily_style_company
  on top_stock_rank_insights_daily(as_of_date desc, valuation_style, company_id);

create table if not exists stock_factor_scores_daily (
  company_id uuid not null references companies(id) on delete cascade,
  as_of_date date not null,
  fundamentals_score numeric not null,
  momentum_score numeric not null,
  sentiment_score numeric not null,
  value_score numeric not null,
  created_at timestamptz not null default now(),
  primary key (company_id, as_of_date)
);

create index if not exists idx_stock_factor_scores_daily_date
  on stock_factor_scores_daily(as_of_date desc, fundamentals_score desc);

create table if not exists stock_highlights_daily (
  company_id uuid not null references companies(id) on delete cascade,
  as_of_date date not null,
  attractive_points jsonb not null default '[]'::jsonb,
  risk_points jsonb not null default '[]'::jsonb,
  generated_by text not null default 'rules',
  created_at timestamptz not null default now(),
  primary key (company_id, as_of_date)
);

-- Dashboard aggregate snapshots
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

-- User-owned canonical intent tables
create table if not exists user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  ticker text not null,
  segment watchlist_segment_enum not null default 'all_holdings',
  thesis text,
  thesis_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_favorites_ticker_uppercase_check check (ticker = upper(ticker)),
  unique(user_id, company_id)
);

create index if not exists idx_user_favorites_user_segment
  on user_favorites(user_id, segment, created_at desc);

create index if not exists idx_user_favorites_user_company_created
  on user_favorites(user_id, company_id, created_at desc);

alter table user_favorites enable row level security;

drop policy if exists "users can read own favorites" on user_favorites;
create policy "users can read own favorites"
  on user_favorites for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own favorites" on user_favorites;
create policy "users can insert own favorites"
  on user_favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can update own favorites" on user_favorites;
create policy "users can update own favorites"
  on user_favorites for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own favorites" on user_favorites;
create policy "users can delete own favorites"
  on user_favorites for delete
  using (auth.uid() = user_id);

create table if not exists user_watchlist_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
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

drop policy if exists "users can read own watchlist alerts" on user_watchlist_alerts;
create policy "users can read own watchlist alerts"
  on user_watchlist_alerts for select
  using (auth.uid() = user_id);

drop policy if exists "users can update own watchlist alerts" on user_watchlist_alerts;
create policy "users can update own watchlist alerts"
  on user_watchlist_alerts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Account settings and subscription canonical tables
create table if not exists user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  region text,
  timezone text not null default 'America/New_York',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_profiles enable row level security;

drop policy if exists "users can read own profile" on user_profiles;
create policy "users can read own profile"
  on user_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "users can upsert own profile" on user_profiles;
create policy "users can upsert own profile"
  on user_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can update own profile" on user_profiles;
create policy "users can update own profile"
  on user_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan_code text not null default 'free',
  plan_status subscription_status_enum not null default 'active',
  billing_interval billing_interval_enum,
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_subscriptions_status_end
  on user_subscriptions(plan_status, current_period_end desc);

alter table user_subscriptions enable row level security;

drop policy if exists "users can read own subscription" on user_subscriptions;
create policy "users can read own subscription"
  on user_subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own subscription" on user_subscriptions;
create policy "users can insert own subscription"
  on user_subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can update own subscription" on user_subscriptions;
create policy "users can update own subscription"
  on user_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  compact_table_density boolean not null default true,
  risk_heatmap_overlay boolean not null default true,
  pre_market_reminder boolean not null default false,
  price_alerts boolean not null default true,
  score_update_digest boolean not null default true,
  earnings_calendar_updates boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_preferences enable row level security;

drop policy if exists "users can read own preferences" on user_preferences;
create policy "users can read own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own preferences" on user_preferences;
create policy "users can insert own preferences"
  on user_preferences for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can update own preferences" on user_preferences;
create policy "users can update own preferences"
  on user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists user_security_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mfa_enabled boolean not null default false,
  last_password_changed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_security_state enable row level security;

drop policy if exists "users can read own security state" on user_security_state;
create policy "users can read own security state"
  on user_security_state for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own security state" on user_security_state;
create policy "users can insert own security state"
  on user_security_state for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can update own security state" on user_security_state;
create policy "users can update own security state"
  on user_security_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists user_api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_name text not null,
  token_hash text not null unique,
  scopes text[] not null default array['read']::text[],
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_api_tokens_user_active
  on user_api_tokens(user_id, created_at desc)
  where revoked_at is null;

create index if not exists idx_companies_ticker_prefix
  on companies (ticker text_pattern_ops);

create index if not exists idx_companies_company_name_trgm
  on companies using gin (company_name gin_trgm_ops);

alter table user_api_tokens enable row level security;

drop policy if exists "users can read own api tokens" on user_api_tokens;
create policy "users can read own api tokens"
  on user_api_tokens for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own api tokens" on user_api_tokens;
create policy "users can insert own api tokens"
  on user_api_tokens for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can update own api tokens" on user_api_tokens;
create policy "users can update own api tokens"
  on user_api_tokens for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace view v_user_settings_snapshot as
select
  p.user_id,
  p.full_name,
  p.email,
  p.region,
  p.timezone,
  coalesce(s.plan_code, 'free') as plan_code,
  s.plan_status,
  s.billing_interval,
  s.current_period_end,
  pref.compact_table_density,
  pref.risk_heatmap_overlay,
  pref.pre_market_reminder,
  pref.price_alerts,
  pref.score_update_digest,
  pref.earnings_calendar_updates,
  sec.mfa_enabled,
  sec.last_password_changed_at,
  (
    select count(*)
    from user_api_tokens t
    where t.user_id = p.user_id
      and t.revoked_at is null
      and (t.expires_at is null or t.expires_at > now())
  ) as active_api_tokens
from user_profiles p
left join user_subscriptions s on s.user_id = p.user_id
left join user_preferences pref on pref.user_id = p.user_id
left join user_security_state sec on sec.user_id = p.user_id;

create or replace function sync_user_favorite_ticker()
returns trigger
language plpgsql
as $$
declare
  company_ticker text;
begin
  select ticker into company_ticker
  from companies
  where id = new.company_id;

  if company_ticker is null then
    raise exception 'company_id % does not exist in companies', new.company_id;
  end if;

  new.ticker = company_ticker;
  return new;
end;
$$;

drop trigger if exists trg_user_favorites_sync_ticker on user_favorites;
create trigger trg_user_favorites_sync_ticker
before insert or update of company_id on user_favorites
for each row
execute function sync_user_favorite_ticker();

drop trigger if exists trg_companies_set_updated_at on companies;
create trigger trg_companies_set_updated_at
before update on companies
for each row
execute function set_updated_at();

drop trigger if exists trg_user_favorites_set_updated_at on user_favorites;
create trigger trg_user_favorites_set_updated_at
before update on user_favorites
for each row
execute function set_updated_at();

drop trigger if exists trg_user_profiles_set_updated_at on user_profiles;
create trigger trg_user_profiles_set_updated_at
before update on user_profiles
for each row
execute function set_updated_at();

drop trigger if exists trg_user_subscriptions_set_updated_at on user_subscriptions;
create trigger trg_user_subscriptions_set_updated_at
before update on user_subscriptions
for each row
execute function set_updated_at();

drop trigger if exists trg_user_preferences_set_updated_at on user_preferences;
create trigger trg_user_preferences_set_updated_at
before update on user_preferences
for each row
execute function set_updated_at();

drop trigger if exists trg_user_security_state_set_updated_at on user_security_state;
create trigger trg_user_security_state_set_updated_at
before update on user_security_state
for each row
execute function set_updated_at();

drop trigger if exists trg_market_stream_state_set_updated_at on market_stream_state;
create trigger trg_market_stream_state_set_updated_at
before update on market_stream_state
for each row
execute function set_updated_at();

-- Derived read models (API-facing)
create or replace view v_company_quotes_latest as
with last_two_closes as (
  select
    company_id,
    max(close) filter (where rn = 1) as last_close,
    max(close) filter (where rn = 2) as previous_close
  from (
    select
      company_id,
      close,
      row_number() over (partition by company_id order by trading_date desc) as rn
    from stock_price_history_daily
  ) ranked
  where rn <= 2
  group by company_id
)
select
  c.id as company_id,
  coalesce(live.price, bars.last_close) as price,
  coalesce(live.previous_close, bars.previous_close) as previous_close,
  case
    when coalesce(live.previous_close, bars.previous_close) is null
      or coalesce(live.previous_close, bars.previous_close) = 0
      or coalesce(live.price, bars.last_close) is null
      then null
    else
      (
        (coalesce(live.price, bars.last_close) - coalesce(live.previous_close, bars.previous_close))
        / coalesce(live.previous_close, bars.previous_close)
      ) * 100
  end as change_percent,
  live.market_cap,
  live.volume,
  live.fetched_at as live_fetched_at,
  extract(epoch from (now() - live.fetched_at))::bigint as quote_age_seconds,
  case
    when live.fetched_at is null then true
    when now() - live.fetched_at > interval '15 minutes' then true
    else false
  end as is_stale,
  coalesce(live.source_provider, 'derived_from_price_history') as source_provider,
  coalesce(live.fetched_at, now()) as fetched_at
from companies c
left join stock_quotes_latest live on live.company_id = c.id
left join last_two_closes bars on bars.company_id = c.id;

create or replace view v_stock_scores_latest as
with latest_date as (
  select max(trading_date) as trading_date
  from stock_scores_daily
)
select
  s.company_id,
  s.trading_date as as_of_date,
  s.valuation_score,
  s.profitability_score,
  s.growth_score,
  s.health_score,
  s.momentum_score,
  s.sentiment_score,
  s.total_score,
  s.recommendation,
  s.explanation,
  s.calculated_at
from stock_scores_daily s
join latest_date d on d.trading_date = s.trading_date;

create or replace view v_top_stock_cards_latest as
with latest_date as (
  select max(as_of_date) as as_of_date
  from top_stock_rankings_daily
)
select
  r.as_of_date,
  r.rank,
  c.id as company_id,
  c.ticker,
  c.company_name,
  c.sector,
  c.industry,
  r.total_score,
  r.recommendation,
  r.valuation_style,
  q.price,
  q.change_percent,
  f.fundamentals_score,
  f.momentum_score,
  f.sentiment_score,
  f.value_score,
  i.why_it_ranks,
  i.algorithm_note
from top_stock_rankings_daily r
join latest_date d on d.as_of_date = r.as_of_date
join companies c on c.id = r.company_id
left join v_company_quotes_latest q on q.company_id = r.company_id
left join stock_factor_scores_daily f
  on f.company_id = r.company_id and f.as_of_date = r.as_of_date
left join top_stock_rank_insights_daily i
  on i.company_id = r.company_id
 and i.as_of_date = r.as_of_date
 and i.valuation_style = r.valuation_style;

create or replace view v_search_cards_latest as
select
  c.id as company_id,
  c.ticker,
  c.company_name,
  c.sector,
  c.industry,
  c.exchange,
  case
    when c.exchange = 'OPRA' then 'option'
    when c.industry ilike '%etf%' or c.sector ilike '%etf%' then 'etf'
    else 'stock'
  end as asset_type,
  coalesce(q.market_cap, c.market_cap) as market_cap,
  s.total_score,
  s.recommendation
from companies c
left join v_company_quotes_latest q on q.company_id = c.id
left join v_stock_scores_latest s on s.company_id = c.id;

create or replace view v_watchlist_rows_latest as
with latest_growth_rank as (
  select company_id, delta_score, recommendation
  from top_stock_rankings_daily
  where as_of_date = (select max(as_of_date) from top_stock_rankings_daily)
    and valuation_style = 'growth'
)
select
  f.user_id,
  f.company_id,
  c.ticker,
  c.company_name,
  c.sector,
  f.segment,
  f.thesis,
  s.total_score as score,
  q.price,
  q.change_percent,
  r.delta_score,
  coalesce(s.recommendation, r.recommendation, 'WATCH') as recommendation,
  f.created_at
from user_favorites f
join companies c on c.id = f.company_id
left join v_stock_scores_latest s on s.company_id = f.company_id
left join v_company_quotes_latest q on q.company_id = f.company_id
left join latest_growth_rank r on r.company_id = f.company_id;
