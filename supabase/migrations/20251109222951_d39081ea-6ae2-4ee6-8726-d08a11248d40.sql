-- Create a public bucket for listing images
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

-- Storage policies for public read and open uploads (prototype)
create policy "Public can read listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Anyone can upload listing images"
  on storage.objects for insert
  with check (bucket_id = 'listing-images');

-- Create listings table to optionally persist ads later
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text,
  category text,
  rating numeric,
  location text,
  phone text,
  latitude double precision,
  longitude double precision,
  images text[] default '{}',
  created_at timestamp with time zone not null default now()
);

alter table public.listings enable row level security;

-- Allow anyone to read listings (public directory-style browsing)
create policy "Anyone can view listings"
  on public.listings for select
  using (true);

-- Allow anonymous inserts for now (no auth yet). Updates/deletes are disabled by omission.
create policy "Anyone can create listing"
  on public.listings for insert
  with check (true);
