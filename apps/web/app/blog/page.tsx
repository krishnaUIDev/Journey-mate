import React from 'react';
import { Box, Typography, Container, Stack } from '@mui/material';
import { getBlogPosts } from '../actions/blog';
import { BlogCard } from '../dashboard/components/BlogCard';
import { BlogHero } from './BlogHero';

export default async function BlogPage() {
    const posts = await getBlogPosts();

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <BlogHero />

            {/* Discovery Grid */}
            <Container maxWidth="xl" sx={{ py: 2 }}>
                {posts.length === 0 ? (
                    <Box sx={{ py: 20, textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'slate.400' }}>
                            Our storytellers are currently on the road.
                        </Typography>
                        <Typography sx={{ color: 'slate.400' }}>
                            Check back soon for new insights!
                        </Typography>
                    </Box>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {posts.map((post) => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </Container>

            {/* Newsletter CTA */}
            <Box sx={{ py: 3, bgcolor: 'white', '.dark &': { bgcolor: '#09090b' } }}>
                <Container maxWidth="md">
                    <Box sx={{
                        p: 8,
                        borderRadius: '3rem',
                        bgcolor: 'slate.50',
                        border: '1px solid rgba(0,0,0,0.05)',
                        textAlign: 'center',
                        '.dark &': { bgcolor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }
                    }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, color: 'slate.900', '.dark &': { color: 'white' } }}>
                            Never miss a destination.
                        </Typography>
                        <Typography sx={{ color: 'slate.500', mb: 4 }}>
                            Get the best travel tips and companion stories delivered to your inbox.
                        </Typography>
                        {/* Simple placeholder for newsletter */}
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 ring-blue-500 transition-all font-bold"
                            />
                            <button className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                                Subscribe
                            </button>
                        </div>
                    </Box>
                </Container>
            </Box>
        </main>
    );
}
