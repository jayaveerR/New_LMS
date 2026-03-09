create table public.playlists (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    youtube_url text not null,
    created_by uuid references auth.users(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.playlists enable row level security;

-- Policies
create policy "Instructors can create their own playlists"
on public.playlists for insert
to authenticated
with check (auth.uid() = created_by);

create policy "Instructors can view their own playlists"
on public.playlists for select
to authenticated
using (auth.uid() = created_by);

create policy "Instructors can update their own playlists"
on public.playlists for update
to authenticated
using (auth.uid() = created_by);

create policy "Instructors can delete their own playlists"
on public.playlists for delete
to authenticated
using (auth.uid() = created_by);
