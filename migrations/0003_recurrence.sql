-- Group weekly (and later recurring) sends. Null = one-off campaign.
alter table campaigns add column if not exists series_id integer;
create index if not exists campaigns_series_idx on campaigns (series_id);
