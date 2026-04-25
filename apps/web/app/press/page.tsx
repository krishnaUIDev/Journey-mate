"use client";

import { useState } from "react";
import { IntlProvider, FormattedMessage } from "react-intl";
import { messages } from "../../i18n/messages";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Box, Container, Typography, Grid, Paper, Stack, Button, Divider } from "@mui/material";
import { Download as DownloadIcon, Article as PressReleaseIcon } from "@mui/icons-material";

type Locale = keyof typeof messages;

const pressReleases = [
    { title: "Journey-mate Announces Strategic Partnership with Major Airlines", date: "Oct 15, 2024" },
    { title: "Series A Funding: Journey-mate Raises $12M to Scale Assisted Travel", date: "Aug 20, 2024" },
    { title: "Journey-mate Launches Verified Companion Program Globally", date: "Jun 10, 2024" }
];

export default function PressPage() {
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

                <Box sx={{ py: { xs: 10, md: 15 }, textAlign: 'center', bgcolor: 'rgba(59,130,246,0.02)' }}>
                    <Container maxWidth="md">
                        <Stack spacing={3}>
                            <Typography variant="overline" sx={{ fontWeight: 900, color: "#3B82F6", letterSpacing: 4 }}>
                                NEWSROOM
                            </Typography>
                            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: "-0.02em", '.dark &': { color: 'white' } }}>
                                Journey-mate Press Kit
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.6, fontWeight: 500, '.dark &': { color: 'white' } }}>
                                Official news, brand assets, and media resources for Journey-mate.
                            </Typography>
                        </Stack>
                    </Container>
                </Box>

                <Box sx={{ py: 10 }}>
                    <Container maxWidth="lg">
                        <Grid container spacing={8}>
                            <Grid size={{ xs: 12, md: 7 }}>
                                <Typography variant="h4" sx={{ fontWeight: 900, mb: 6, '.dark &': { color: 'white' } }}>Press Releases</Typography>
                                <Stack spacing={4}>
                                    {pressReleases.map((pr, index) => (
                                        <Box key={index}>
                                            <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
                                                <PressReleaseIcon sx={{ color: '#3B82F6', fontSize: 24, mt: 0.5 }} />
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 800, '.dark &': { color: 'white' } }}>{pr.title}</Typography>
                                                    <Typography variant="caption" sx={{ opacity: 0.5, display: 'block', mt: 0.5, '.dark &': { color: 'white' } }}>{pr.date}</Typography>
                                                </Box>
                                            </Stack>
                                            {index < pressReleases.length - 1 && <Divider sx={{ mt: 4, opacity: 0.1 }} />}
                                        </Box>
                                    ))}
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, md: 5 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 5,
                                        borderRadius: '2.5rem',
                                        bgcolor: '#0f172a',
                                        color: 'white',
                                        position: 'sticky',
                                        top: 100
                                    }}
                                >
                                    <Stack spacing={4}>
                                        <Typography variant="h5" sx={{ fontWeight: 900 }}>Brand Resources</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                            Download our official logos, brand guidelines, and high-resolution press photos.
                                        </Typography>
                                        <Stack spacing={2}>
                                            <Button
                                                variant="contained"
                                                startIcon={<DownloadIcon />}
                                                fullWidth
                                                sx={{ bgcolor: 'white', color: '#0f172a', borderRadius: '1rem', py: 1.5, fontWeight: 800, '&:hover': { bgcolor: '#e2e8f0' } }}
                                            >
                                                Brand Kit (.zip)
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<DownloadIcon />}
                                                fullWidth
                                                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '1rem', py: 1.5, fontWeight: 800, '&:hover': { borderColor: 'white' } }}
                                            >
                                                Logo Pack (.svg)
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                <Footer theme={theme} />
            </main>
        </IntlProvider>
    );
}
