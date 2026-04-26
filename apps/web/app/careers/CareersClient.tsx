"use client";

import { useState } from "react";
import { IntlProvider } from "react-intl";
import { messages } from "../../i18n/messages";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Box, Container, Typography, Grid, Paper, Stack, Button, Chip } from "@mui/material";

type Locale = keyof typeof messages;

interface Job {
    id: string;
    title: string;
    dept: string;
    type: string;
    location: string;
}

interface CareersClientProps {
    jobs: Job[];
}

export default function CareersClient({ jobs }: CareersClientProps) {
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

                <Box sx={{ py: { xs: 6, md: 8 }, textAlign: 'center', bgcolor: 'rgba(59,130,246,0.02)' }}>
                    <Container maxWidth="md">
                        <Stack spacing={3}>
                            <Typography variant="overline" sx={{ fontWeight: 900, color: "#3B82F6", letterSpacing: 4 }}>
                                CAREERS
                            </Typography>
                            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: "-0.02em", '.dark &': { color: 'white' } }}>
                                Join the Movement
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.6, fontWeight: 500, '.dark &': { color: 'white' } }}>
                                Help us build the world's most compassionate travel community. We're looking for humans who care.
                            </Typography>
                        </Stack>
                    </Container>
                </Box>

                <Box sx={{ py: 6 }}>
                    <Container maxWidth="lg">
                        <Typography variant="h4" sx={{ fontWeight: 900, mb: 6, '.dark &': { color: 'white' } }}>Open Positions</Typography>

                        {jobs.length === 0 ? (
                            <Box sx={{
                                textAlign: 'center', py: 8, px: 4,
                                borderRadius: '2rem',
                                border: '1px dashed',
                                borderColor: 'rgba(0,0,0,0.08)',
                                '.dark &': { borderColor: 'rgba(255,255,255,0.08)' }
                            }}>
                                <Typography variant="h2" sx={{ mb: 1 }}>🌍</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, '.dark &': { color: 'white' } }}>
                                    No open positions right now
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.5, maxWidth: 400, mx: 'auto', '.dark &': { color: 'white' } }}>
                                    We're growing fast — check back soon or send your CV to{' '}
                                    <a href="mailto:careers@journey-mate.com" style={{ color: '#3B82F6', fontWeight: 700 }}>
                                        careers@journey-mate.com
                                    </a>
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={3}>
                                {jobs.map((job) => (
                                    <Paper
                                        key={job.id}
                                        elevation={0}
                                        sx={{
                                            p: 4,
                                            borderRadius: '2rem',
                                            bgcolor: 'rgba(0,0,0,0.02)',
                                            border: '1px solid rgba(0,0,0,0.05)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                bgcolor: 'white',
                                                transform: 'translateX(10px)',
                                                boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
                                            },
                                            '.dark &': {
                                                bgcolor: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                '&:hover': { bgcolor: '#0f172a' }
                                            }
                                        }}
                                    >
                                        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Typography variant="h5" sx={{ fontWeight: 800, '.dark &': { color: 'white' } }}>{job.title}</Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.6, '.dark &': { color: 'white' } }}>{job.dept}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 4 }}>
                                                <Stack direction="row" spacing={1}>
                                                    <Chip label={job.type} size="small" sx={{ fontWeight: 700 }} />
                                                    <Chip label={job.location} size="small" sx={{ fontWeight: 700 }} />
                                                </Stack>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 2 }}>
                                                <Button variant="outlined" sx={{ borderRadius: '1rem', fontWeight: 800, textTransform: 'none' }}>Apply Now</Button>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </Container>
                </Box>

                <Footer theme={theme} />
            </main>
        </IntlProvider>
    );
}
