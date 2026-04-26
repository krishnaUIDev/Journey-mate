-- Create jobs table for careers page
create table if not exists public.jobs (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    dept text not null,
    type text not null,       -- e.g. 'Full-time', 'Remote', 'Contract'
    location text not null,   -- e.g. 'Remote', 'Bangalore / Remote'
    active boolean default true,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.jobs enable row level security;

-- Anyone can read active jobs (public page)
create policy "Jobs are publicly readable"
    on public.jobs for select
    using (active = true);

-- Insert initial jobs
insert into public.jobs (title, dept, type, location) values
('Senior Product Designer', 'Design', 'Remote', 'Global'),
('Backend Engineer (NestJS)', 'Engineering', 'Full-time', 'Remote / London'),
('Community Manager', 'Operations', 'Full-time', 'Remote'),
('Customer Success Lead', 'Support', 'Full-time', 'Bangalore / Remote');
