-- Dynamic Blog Hub: Destination Insights & Traveler Stories

create table if not exists public.blog_posts (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null unique,
    excerpt text,
    content text not null, -- Markdown content
    image_url text, -- Featured image
    author_id text not null, -- Clerk ID of the traveler
    author_name text not null,
    author_avatar text,
    location_label text, -- "Tokyo, Japan"
    location_coords jsonb, -- {lat: 35.6762, lng: 139.6503}
    category text default 'Travel Tips',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.blog_posts enable row level security;

-- Policies
create policy "Blog posts are publicly readable"
    on public.blog_posts for select
    using (true);

-- Seed some sample travel stories
insert into public.blog_posts (title, slug, excerpt, content, image_url, author_id, author_name, author_avatar, location_label, location_coords, category)
values 
(
    'Hidden Gems of Tokyo: A Local Guide',
    'hidden-gems-tokyo',
    'Beyond the neon lights of Shibuya lies a world of quiet temples and secret cafes...',
    '# Hidden Gems of Tokyo\n\nTokyo is a city of contrasts. While most tourists flock to the busy intersections of Shibuya and Shinjuku, the real magic happens in the narrow alleys of Yanaka Ginza and the quiet parks of Meguro.\n\n### The Yanaka Aesthetic\nYanaka Ginza is one of the few districts where the "shitamachi" atmosphere remains. It survived the bombings of WWII, preserving its historical charm.\n\n### Where to eat\nDon''t miss the small "Taiyaki" stands near the main gate. The red bean filling is the perfect companion for a walk in the afternoon sun.',
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1200',
    'user_2P6J6J6J6J6J6J6J6J6J6J', -- Placeholder author
    'Aoi Tanaka',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    'Tokyo, Japan',
    '{"lat": 35.6762, "lng": 139.6503}',
    'Discovery'
),
(
    'The Best Coffee Spots in London',
    'london-coffee-guide',
    'From brick-and-mortar roasteries to independent stalls, London''s coffee scene is buzzing...',
    '# London''s Coffee Culture\n\nThe coffee scene in London has exploded over the last decade. Whether you''re looking for a quick caffeine fix or a place to settle in with your laptop, there''s a spot for every traveler.\n\n### Monmouth Coffee Company\nA classic. Always a queue, but always worth it. Their espresso is legendary among locals.',
    'https://images.unsplash.com/photo-1511300633959-19e7a5d71ee7?auto=format&fit=crop&q=80&w=1200',
    'user_2P7K7K7K7K7K7K7K7K7K7L',
    'James Miller',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    'London, UK',
    '{"lat": 51.5074, "lng": -0.1278}',
    'Lifestyle'
);
