import React from 'react';
import { Box, Typography, Container, Stack, Breadcrumbs, Link as MuiLink, Button } from '@mui/material';
import {
    NavigateNext as NextIcon,
    CalendarToday as DateIcon,
    Map as MapIcon
} from '@mui/icons-material';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import dayjs from 'dayjs';
import { getPostBySlug } from '../../actions/blog';
import { AuthorCard } from '../../dashboard/components/AuthorCard';
import { BlogMapSection } from '../BlogMapSection';



export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return (
            <Container sx={{ py: 20, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>Post not found.</Typography>
                <Link href="/blog" style={{ marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}>
                    <MuiLink component="span">Back to Blog</MuiLink>
                </Link>
            </Container>
        );
    }

    const centerCoord: [number, number] = post.location_coords ? [post.location_coords.lat, post.location_coords.lng] : [0, 0];

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950">
            {/* 1. Header & Breadcrumbs */}
            <Box sx={{ pt: 12, pb: 6, borderBottom: '1px solid rgba(0,0,0,0.05)', '.dark &': { borderColor: 'rgba(255,255,255,0.05)' } }}>
                <Container maxWidth="lg">
                    <Breadcrumbs
                        separator={<NextIcon fontSize="small" />}
                        sx={{ mb: 4, '& .MuiTypography-root': { fontWeight: 700, fontSize: '0.8rem' } }}
                    >
                        <Link href="/blog" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <MuiLink component="span" color="inherit" underline="hover">BLOG</MuiLink>
                        </Link>
                        <Typography color="text.primary" sx={{ '.dark &': { color: 'slate.400' } }}>{post.category.toUpperCase()}</Typography>
                    </Breadcrumbs>

                    <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mb-6">
                        {post.title}
                    </h1>

                    <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <DateIcon sx={{ fontSize: 16, color: 'slate.400' }} />
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'slate.500' }}>
                                {dayjs(post.created_at).format('LL')}
                            </Typography>
                        </Stack>
                        {post.location_label && (
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <MapIcon sx={{ fontSize: 16, color: '#3B82F6' }} />
                                <Typography variant="caption" sx={{ fontWeight: 900, color: '#3B82F6', textTransform: 'uppercase' }}>
                                    {post.location_label}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                </Container>
            </Box>

            {/* 2. Interactive Orientation Map */}
            {post.location_coords && (
                <BlogMapSection
                    center={centerCoord}
                    label={post.location_label || "Location"}
                />
            )}

            {/* 3. Post Content */}
            <Container maxWidth="md" sx={{ py: 10 }}>
                <Box sx={{ position: 'relative', mb: 8, borderRadius: '3rem', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                    <Image
                        src={post.image_url}
                        alt={post.title}
                        width={1200}
                        height={600}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                </Box>

                <div className="prose prose-slate lg:prose-xl dark:prose-invert max-w-none">
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '1.2rem' }}>
                        {/* Note: In a real app we'd use react-markdown here */}
                        {post.content}
                    </div>
                </div>

                {/* 4. Author Traveler Card */}
                <Box sx={{ mt: 12, pt: 8, borderTop: '1px solid rgba(0,0,0,0.05)', '.dark &': { borderColor: 'rgba(255,255,255,0.05)' } }}>
                    <Typography variant="overline" sx={{ fontWeight: 900, color: 'slate.400', letterSpacing: '0.2em', mb: 4, display: 'block' }}>
                        ABOUT THE STORYTELLER
                    </Typography>
                    <AuthorCard
                        authorId={post.author_id}
                        name={post.author_name}
                        avatar={post.author_avatar}
                    />
                </Box>
            </Container>

            {/* 5. Footer Navigation */}
            <Box sx={{ py: 10, bgcolor: 'slate.50', borderTop: '1px solid rgba(0,0,0,0.05)', '.dark &': { bgcolor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' } }}>
                <Container maxWidth="lg">
                    <Stack direction="row" sx={{ justifyContent: 'center' }}>
                        <Link href="/blog" style={{ textDecoration: 'none' }}>
                            <Button
                                variant="contained"
                                sx={{
                                    borderRadius: '2rem',
                                    fontWeight: 900,
                                    px: 6,
                                    py: 1.5,
                                    bgcolor: '#3B82F6',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#2563EB' }
                                }}
                            >
                                Back to Discover
                            </Button>
                        </Link>
                    </Stack>
                </Container>
            </Box>
        </main>
    );
}
