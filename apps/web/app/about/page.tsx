"use client";

import { useState } from "react";
import { IntlProvider, FormattedMessage } from "react-intl";
import { messages } from "../../i18n/messages";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Box, Container, Typography, Grid, Paper, Stack } from "@mui/material";

type Locale = keyof typeof messages;

export default function AboutPage() {
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

                <Box sx={{ py: { xs: 6, md: 10 }, position: 'relative', overflow: 'hidden' }}>
                    <Container maxWidth="lg">
                        <Grid container spacing={6} sx={{ alignItems: 'center' }}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Stack spacing={3}>
                                    <Typography variant="overline" sx={{ fontWeight: 900, color: "#10B981", letterSpacing: 4 }}>
                                        OUR STORY
                                    </Typography>
                                    <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: "-0.02em", '.dark &': { color: 'white' } }}>
                                        Bridging Generations Through Travel
                                    </Typography>
                                    <Typography variant="h6" sx={{ opacity: 0.7, fontWeight: 500, lineHeight: 1.6, '.dark &': { color: 'white' } }}>
                                        Journey-mate was born from a simple observation: millions of elderly and vulnerable travelers often feel anxious or restricted when flying solo.
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box
                                    component="img"
                                    src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=1000"
                                    sx={{
                                        width: '100%',
                                        borderRadius: '2.5rem',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                        transform: 'rotate(-1deg)'
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                <Box sx={{ py: 8, bgcolor: 'rgba(0,0,0,0.02)', '.dark &': { bgcolor: 'rgba(255,255,255,0.01)' } }}>
                    <Container maxWidth="lg">
                        <Grid container spacing={6}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Stack spacing={1}>
                                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#10B981' }}>50k+</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 800, '.dark &': { color: 'white' } }}>Journeys Assisted</Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.6, '.dark &': { color: 'white' } }}>Across 120+ countries and thousands of flight routes worldwide.</Typography>
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Stack spacing={1}>
                                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#3B82F6' }}>98%</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 800, '.dark &': { color: 'white' } }}>Safety Rating</Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.6, '.dark &': { color: 'white' } }}>Our community prioritizes safety above all else, vetted by rigorous checks.</Typography>
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Stack spacing={1}>
                                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#8B5CF6' }}>24/7</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 800, '.dark &': { color: 'white' } }}>Global Support</Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.6, '.dark &': { color: 'white' } }}>Always here to help you coordinate and travel with peace of mind.</Typography>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                <Footer theme={theme} />
            </main>
        </IntlProvider>
    );
}
