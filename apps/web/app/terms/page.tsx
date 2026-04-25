"use client";

import { useState } from "react";
import { IntlProvider, FormattedMessage } from "react-intl";
import { messages } from "../../i18n/messages";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Box, Container, Typography, Stack, Divider } from "@mui/material";

type Locale = keyof typeof messages;

export default function TermsPage() {
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

                <Box sx={{ py: { xs: 8, md: 12 } }}>
                    <Container maxWidth="md">
                        <Stack spacing={4}>
                            <Box sx={{ mb: 6 }}>
                                <Typography variant="overline" sx={{ fontWeight: 900, color: "#3B82F6", letterSpacing: 4 }}>
                                    LEGAL
                                </Typography>
                                <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: "-0.02em", mt: 1, '.dark &': { color: 'white' } }}>
                                    Terms of Service
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.5, mt: 2, '.dark &': { color: 'white' } }}>
                                    Last Updated: October 25, 2024
                                </Typography>
                            </Box>

                            <Box sx={{ '.dark &': { color: 'white' } }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>1. Acceptance of Terms</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.7, lineHeight: 1.8, mb: 4 }}>
                                    By accessing or using Journey-mate, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                                </Typography>

                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>2. User Responsibilities</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.7, lineHeight: 1.8, mb: 4 }}>
                                    Users are responsible for the accuracy of the information they provide. Companions must adhere to the agreed-upon assistance levels, and travelers must respect the companion's time and boundaries.
                                </Typography>

                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>3. Limitation of Liability</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.7, lineHeight: 1.8, mb: 4 }}>
                                    Journey-mate is a connection platform. We are not liable for any incidents that occur during travel. Users are encouraged to use the verification and safety features provided.
                                </Typography>

                                <Divider sx={{ my: 6, opacity: 0.1 }} />

                                <Typography variant="body2" sx={{ opacity: 0.5 }}>
                                    Questions? Contact legal@journey-mate.com.
                                </Typography>
                            </Box>
                        </Stack>
                    </Container>
                </Box>

                <Footer theme={theme} />
            </main>
        </IntlProvider>
    );
}
