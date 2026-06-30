-- generations table
create table if not exists public.generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'uploading' check (status in ('uploading', 'paid', 'processing', 'complete', 'failed')),
  stripe_session_id text,
  photo_count integer default 0,
  replicate_prediction_id text,
  result_urls text[],
  error_message text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.generations enable row level security;

create policy "Users can view their own generations"
  on public.generations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own generations"
  on public.generations for update
  using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger generations_updated_at
  before update on public.generations
  for each row execute procedure public.handle_updated_at();

-- Storage buckets (run in Supabase dashboard or via CLI)
-- insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- values ('uploads', 'uploads', false, 10485760, array['image/jpeg','image/png','image/webp','image/heic']);
-- insert into storage.buckets (id, name, public, file_size_limit)
-- values ('results', 'results', true, 52428800);
