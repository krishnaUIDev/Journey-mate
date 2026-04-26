"use client";

import { useState } from "react";
import { IntlProvider, FormattedMessage } from "react-intl";
import { messages } from "../../i18n/messages";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Box, Container, Typography, Grid, Paper, Stack, Button } from "@mui/material";
import {
    VerifiedUser as VerifiedIcon,
    LocationOn as TrackingIcon,
    SupportAgent as SupportIcon,
    Shield as ShieldIcon
} from "@mui/icons-material";

type Locale = keyof typeof messages;

const safetyFeatures = [
    {
        icon: <VerifiedIcon sx={{ fontSize: 40, color: "#10B981" }} />,
        titleId: "safety.verify.title",
        descId: "safety.verify.desc",
        color: "#10B981"
    },
    {
        icon: <TrackingIcon sx={{ fontSize: 40, color: "#3B82F6" }} />,
        titleId: "safety.tracking.title",
        descId: "safety.tracking.desc",
        color: "#3B82F6"
    },
    {
        icon: <SupportIcon sx={{ fontSize: 40, color: "#8B5CF6" }} />,
        titleId: "safety.support.title",
        descId: "safety.support.desc",
        color: "#8B5CF6"
    },
    {
        icon: <ShieldIcon sx={{ fontSize: 40, color: "#EF4444" }} />,
        titleId: "safety.shield.title",
        descId: "safety.shield.desc",
        color: "#EF4444"
    }
];

export default function SafetyPage() {
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

                <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#0f172a', color: 'white' }}>
                    <Container maxWidth="lg">
                        <Grid container spacing={8} sx={{ alignItems: 'center' }}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Stack spacing={3}>
                                    <Typography variant="overline" sx={{ fontWeight: 900, color: "#10B981", letterSpacing: 4 }}>
                                        <FormattedMessage id="safety.header.badge" />
                                    </Typography>
                                    <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
                                        <FormattedMessage id="safety.header.title" />
                                    </Typography>
                                    <Typography variant="h6" sx={{ opacity: 0.7, fontWeight: 500, lineHeight: 1.6 }}>
                                        <FormattedMessage id="safety.header.desc" />
                                    </Typography>
                                    <Box sx={{ pt: 2 }}>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            sx={{
                                                bgcolor: '#10B981',
                                                borderRadius: '1rem',
                                                px: 4, py: 2,
                                                fontWeight: 900,
                                                '&:hover': { bgcolor: '#059669' }
                                            }}
                                        >
                                            <FormattedMessage id="safety.cta.learnMore" />
                                        </Button>
                                    </Box>
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box
                                    component="img"
                                    src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1000"
                                    sx={{
                                        width: '100%',
                                        borderRadius: '3rem',
                                        boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
                                        transform: 'rotate(2deg)'
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                <Box sx={{ py: 8 }}>
                    <Container maxWidth="lg">
                        <Grid container spacing={4}>
                            {safetyFeatures.map((feature, index) => (
                                <Grid size={{ xs: 12, md: 6 }} key={index}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 6,
                                            borderRadius: '2.5rem',
                                            bgcolor: index % 2 === 0 ? 'rgba(16,185,129,0.03)' : 'rgba(59,130,246,0.03)',
                                            border: '1px solid rgba(0,0,0,0.05)',
                                            '.dark &': {
                                                bgcolor: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                color: 'white'
                                            }
                                        }}
                                    >
                                        <Stack spacing={3}>
                                            <Box sx={{
                                                width: 70, height: 70, borderRadius: '1.25rem',
                                                bgcolor: 'white', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                                                '.dark &': { bgcolor: '#1e293b' }
                                            }}>
                                                {feature.icon}
                                            </Box>
                                            <Typography variant="h4" sx={{ fontWeight: 900 }}>
                                                <FormattedMessage id={feature.titleId} defaultMessage="Safety Feature" />
                                            </Typography>
                                            <Typography variant="body1" sx={{ opacity: 0.6, fontSize: '1.1rem', lineHeight: 1.7 }}>
                                                <FormattedMessage id={feature.descId} defaultMessage="Description of the safety feature and how it protects users." />
                                            </Typography>
                                        </Stack>
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
