-- Enable blog post creation via Server Actions

create policy "Anyone can create blog posts"
    on public.blog_posts for insert
    with check (true);

create policy "Anyone can update their own blog posts"
    on public.blog_posts for update
    using (true);
