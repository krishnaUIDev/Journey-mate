"use client";

import React from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Chip, Stack } from '@mui/material';
import { AccessTime as TimeIcon, Person as AuthorIcon } from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import dayjs from 'dayjs';
import { BlogPost } from '../../actions/blog';

interface BlogCardProps {
    post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
    return (
        <Card
            component={Link}
            href={`/blog/${post.slug}`}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                borderRadius: '2.5rem',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.04)',
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: '0 20px 60px -15px rgba(59, 130, 246, 0.15)',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    bgcolor: 'white'
                },
                '.dark &': {
                    bgcolor: 'rgba(24, 24, 27, 0.6)',
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                    '&:hover': {
                        bgcolor: 'rgba(39, 39, 42, 0.8)',
                        borderColor: 'rgba(59, 130, 246, 0.4)'
                    }
                }
            }}
        >
            <Box sx={{ position: 'relative', height: 200 }}>
                <Image
                    src={post.image_url || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800"}
                    alt={post.title}
                    fill
                    style={{ objectFit: 'cover' }}
                />
                <Box sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 10
                }}>
                    <Chip
                        label={post.category}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(8px)',
                            color: 'white',
                            fontWeight: 900,
                            letterSpacing: '0.05em',
                            fontSize: '0.65rem',
                            textTransform: 'uppercase',
                            borderRadius: '1rem',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                    />
                </Box>
            </Box>

            <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 900,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                        mb: 1,
                        color: 'slate.900',
                        '.dark &': { color: 'white' }
                    }}
                >
                    {post.title}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: 'slate.500',
                        lineHeight: 1.6,
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontWeight: 500,
                        '.dark &': { color: 'slate.400' }
                    }}
                >
                    {post.excerpt}
                </Typography>

                <Box sx={{ mt: 'auto', pt: 3, borderTop: '1px solid rgba(0,0,0,0.05)', '.dark &': { borderColor: 'rgba(255,255,255,0.05)' } }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Box sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '2px solid white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                '.dark &': { border: '2px solid #18181b' }
                            }}>
                                <Image
                                    src={post.author_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=50"}
                                    alt={post.author_name}
                                    width={28}
                                    height={28}
                                />
                            </Box>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'slate.700', '.dark &': { color: 'slate.300' } }}>
                                {post.author_name}
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <TimeIcon sx={{ fontSize: 14, color: 'slate.400' }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'slate.400' }}>
                                {dayjs(post.created_at).format('MMM D')}
                            </Typography>
                        </Stack>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}
