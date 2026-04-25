"use client";

import { useState } from "react";
import { IntlProvider, FormattedMessage } from "react-intl";
import { messages } from "../../i18n/messages";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Box, Container, Typography, Grid, Paper, Stack, Button, Avatar } from "@mui/material";

type Locale = keyof typeof messages;

const posts = [
    {
        title: "The Future of Assisted Travel: Technology Meets Compassion",
        excerpt: "How we're using real-time tracking and verified matching to make flying safer for everyone.",
        author: "Sarah J.",
        date: "Oct 24, 2024",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1540339832862-eb69d81d604b?auto=format&fit=crop&q=80&w=600"
    },
    {
        title: "5 Tips for Being a Rockstar Travel Companion",
        excerpt: "Learn the best practices for assisting seniors and families during long-haul flights.",
        author: "David C.",
        date: "Oct 12, 2024",
        category: "Guide",
        image: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=600"
    },
    {
        title: "Journey-mate's Impact: Real Stories from the Sky",
        excerpt: "A collection of heartwarming testimonials from our community of travelers and mates.",
        author: "Elena R.",
        date: "Sep 28, 2024",
        category: "Community",
        image: "https://images.unsplash.com/photo-1506012733851-46297340003c?auto=format&fit=crop&q=80&w=600"
    }
];

export default function BlogPage() {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [locale, setLocale] = useState<Locale>("en");

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        if (newTheme === "dark") document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
    };

    const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLocale(e.target.value as Locale);
    };

    return (
        <IntlProvider messages={messages[locale]} locale={locale} defaultLocale="en">
            <main className="min-h-screen bg-white dark:bg-black transition-colors">
                <Header theme={theme} toggleTheme={toggleTheme} locale={locale} handleLocaleChange={handleLocaleChange} />

                <Box sx={{ py: { xs: 6, md: 8 }, textAlign: 'center' }}>
                    <Container maxWidth="md">
                        <Stack spacing={2}>
                            <Typography variant="overline" sx={{ fontWeight: 900, color: "#8B5CF6", letterSpacing: 4 }}>
                                BLOG
                            </Typography>
                            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: "-0.02em", '.dark &': { color: 'white' } }}>
                                Stories from the Sky
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.6, fontWeight: 500, '.dark &': { color: 'white' } }}>
                                Insights, guides, and heartwarming stories from our community.
                            </Typography>
                        </Stack>
                    </Container>
                </Box>

                <Box sx={{ py: 6 }}>
                    <Container maxWidth="lg">
                        <Grid container spacing={4}>
                            {posts.map((post, index) => (
                                <Grid size={{ xs: 12, md: 4 }} key={index}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            borderRadius: '2.5rem',
                                            overflow: 'hidden',
                                            bgcolor: 'rgba(0,0,0,0.02)',
                                            border: '1px solid rgba(0,0,0,0.05)',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.3s ease',
                                            '&:hover': { transform: 'translateY(-10px)' },
                                            '.dark &': {
                                                bgcolor: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                color: 'white'
                                            }
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={post.image}
                                            sx={{ height: 240, width: '100%', objectFit: 'cover' }}
                                        />
                                        <Box sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: 1 }}>
                                                {post.category}
                                            </Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, mb: 2 }}>
                                                {post.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.6, mb: 4 }}>
                                                {post.excerpt}
                                            </Typography>
                                            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mt: 'auto' }}>
                                                <Avatar sx={{ width: 32, height: 32, fontWeight: 900, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                                                    {post.author[0]}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{post.author}</Typography>
                                                    <Typography variant="caption" sx={{ opacity: 0.5 }}>{post.date}</Typography>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>

                <Footer theme={theme} />
            </main>
        </IntlProvider>
    );
}
