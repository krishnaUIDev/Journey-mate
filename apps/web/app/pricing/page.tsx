"use client";

import { useState } from "react";
import { IntlProvider, FormattedMessage } from "react-intl";
import { messages } from "../../i18n/messages";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Box, Container, Typography, Grid, Paper, Stack, Button, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Check as CheckIcon } from "@mui/icons-material";

type Locale = keyof typeof messages;

const plans = [
    {
        titleId: "pricing.free.title",
        price: "$0",
        period: "pricing.period.forever",
        features: [
            "pricing.feature.post",
            "pricing.feature.basic",
            "pricing.feature.chat",
            "pricing.feature.vibe"
        ],
        buttonText: "pricing.button.free",
        highlight: false
    },
    {
        titleId: "pricing.premium.title",
        price: "$9.99",
        period: "pricing.period.month",
        features: [
            "pricing.feature.verified",
            "pricing.feature.priority",
            "pricing.feature.tracking",
            "pricing.feature.sos",
            "pricing.feature.support"
        ],
        buttonText: "pricing.button.premium",
        highlight: true
    }
];

export default function PricingPage() {
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
                        <Stack spacing={3} sx={{ mb: 10 }}>
                            <Typography variant="overline" sx={{ fontWeight: 900, color: "#3B82F6", letterSpacing: 4 }}>
                                <FormattedMessage id="pricing.header.badge" />
                            </Typography>
                            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: "-0.02em", '.dark &': { color: 'white' } }}>
                                <FormattedMessage id="pricing.header.title" />
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.6, fontWeight: 500, '.dark &': { color: 'white' } }}>
                                <FormattedMessage id="pricing.header.desc" />
                            </Typography>
                        </Stack>

                        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
                            {plans.map((plan, index) => (
                                <Grid size={{ xs: 12, md: 6 }} key={index}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 6,
                                            height: '100%',
                                            borderRadius: '3rem',
                                            bgcolor: plan.highlight ? '#1e293b' : 'rgba(0,0,0,0.02)',
                                            color: plan.highlight ? 'white' : 'text.primary',
                                            border: plan.highlight ? 'none' : '1px solid rgba(0,0,0,0.05)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'transform 0.3s ease',
                                            '&:hover': { transform: 'scale(1.02)' },
                                            '.dark &': {
                                                bgcolor: plan.highlight ? '#0f172a' : 'rgba(255,255,255,0.02)',
                                                border: plan.highlight ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.05)',
                                                color: 'white'
                                            }
                                        }}
                                    >
                                        {plan.highlight && (
                                            <Box sx={{
                                                position: 'absolute', top: 20, right: -30,
                                                bgcolor: '#3B82F6', px: 6, py: 0.5,
                                                transform: 'rotate(45deg)', fontWeight: 900, fontSize: '0.75rem'
                                            }}>
                                                POPULAR
                                            </Box>
                                        )}
                                        <Stack spacing={4} sx={{ textAlign: 'left' }}>
                                            <Box>
                                                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                                                    <FormattedMessage id={plan.titleId} />
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                                    <Typography variant="h2" sx={{ fontWeight: 900 }}>{plan.price}</Typography>
                                                    <Typography variant="body1" sx={{ opacity: 0.6 }}>
                                                        / <FormattedMessage id={plan.period} />
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <List sx={{ flexGrow: 1 }}>
                                                {plan.features.map((feature, fIndex) => (
                                                    <ListItem key={fIndex} sx={{ px: 0, py: 1 }}>
                                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                                            <CheckIcon sx={{ color: plan.highlight ? '#10B981' : '#3B82F6' }} />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={<FormattedMessage id={feature} />}
                                                            slotProps={{
                                                                primary: { sx: { fontWeight: 500, fontSize: '0.95rem' } }
                                                            }}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>

                                            <Button
                                                variant="contained"
                                                fullWidth
                                                size="large"
                                                sx={{
                                                    borderRadius: '1.5rem',
                                                    py: 2,
                                                    fontWeight: 900,
                                                    bgcolor: plan.highlight ? '#3B82F6' : 'rgba(0,0,0,0.1)',
                                                    color: plan.highlight ? 'white' : 'text.primary',
                                                    '&:hover': { bgcolor: plan.highlight ? '#2563EB' : 'rgba(0,0,0,0.2)' },
                                                    '.dark &': {
                                                        bgcolor: plan.highlight ? '#3B82F6' : 'rgba(255,255,255,0.1)',
                                                        color: 'white'
                                                    }
                                                }}
                                            >
                                                <FormattedMessage id={plan.buttonText} />
                                            </Button>
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
