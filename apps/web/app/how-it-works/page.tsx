"use client";

import { useState } from "react";
import { IntlProvider, FormattedMessage } from "react-intl";
import { messages } from "../../i18n/messages";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Box, Container, Typography, Grid, Paper, Stack } from "@mui/material";

type Locale = keyof typeof messages;

export default function HowItWorksPage() {
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

                <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', bgcolor: 'rgba(59,130,246,0.03)', '.dark &': { bgcolor: 'rgba(59,130,246,0.01)' } }}>
                    <Container maxWidth="md">
                        <Stack spacing={2}>
                            <Typography variant="overline" sx={{ fontWeight: 900, color: "#3B82F6", letterSpacing: 4 }}>
                                <FormattedMessage id="how.process" />
                            </Typography>
                            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: "-0.02em", '.dark &': { color: 'white' } }}>
                                <FormattedMessage id="how.title" />
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.6, fontWeight: 500, '.dark &': { color: 'white' } }}>
                                <FormattedMessage id="how.subtitle" />
                            </Typography>
                        </Stack>
                    </Container>
                </Box>

                <Box sx={{ py: { xs: 8, md: 12 }, position: 'relative', overflow: 'hidden' }}>
                    {/* Background Accents */}
                    <Box sx={{
                        position: 'absolute', top: -100, right: -100, width: 400, height: 400,
                        borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
                        zIndex: 0
                    }} />

                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                        <Grid container spacing={4}>
                            {[1, 2, 3, 4].map((step) => (
                                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={step}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 4,
                                            height: '100%',
                                            borderRadius: '2.5rem',
                                            bgcolor: 'rgba(0,0,0,0.02)',
                                            border: '1px solid rgba(0,0,0,0.05)',
                                            transition: 'transform 0.3s ease',
                                            '&:hover': { transform: 'translateY(-10px)' },
                                            '.dark &': {
                                                bgcolor: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                color: 'white'
                                            }
                                        }}
                                    >
                                        <Box sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '1rem',
                                            bgcolor: 'primary.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 900,
                                            mb: 3
                                        }}>
                                            {step}
                                        </Box>
                                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                                            <FormattedMessage id={`how.step${step}.title`} />
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.6, lineHeight: 1.6 }}>
                                            <FormattedMessage id={`how.step${step}.desc`} />
                                        </Typography>
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
