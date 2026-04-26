-- Create journey_guestbook table for heartfelt reflections
create table if not exists public.journey_guestbook (
    id uuid default gen_random_uuid() primary key,
    journey_id uuid references public.journeys(id) on delete cascade not null,
    author_id text not null,      -- Clerk User ID
    author_name text not null,
    author_avatar text,
    content text not null,
    emotion text,                -- Emoji or mood
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.journey_guestbook enable row level security;

-- Participants can read guestbook
create policy "Journey participants can read guestbook"
    on public.journey_guestbook for select
    using (
        exists (
            select 1 from public.journeys j
            left join public.journey_requests r on r.journey_id = j.id
            where j.id = journey_guestbook.journey_id
            and (j.user_id = auth.uid()::text or (r.requester_id = auth.uid()::text and r.status = 'accepted'))
        )
    );

-- Participants can add to guestbook
create policy "Journey participants can add to guestbook"
    on public.journey_guestbook for insert
    with check (
        exists (
            select 1 from public.journeys j
            left join public.journey_requests r on r.journey_id = j.id
            where j.id = journey_id
            and (j.user_id = auth.uid()::text or (r.requester_id = auth.uid()::text and r.status = 'accepted'))
        )
    );
