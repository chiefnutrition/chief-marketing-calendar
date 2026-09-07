-- Events need an end date/time. EDM and SMS leave these empty.
alter table campaigns add column if not exists end_date date;
alter table campaigns add column if not exists end_time text not null default '';
