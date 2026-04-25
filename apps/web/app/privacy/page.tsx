"use client";

import { useState } from "react";
import { IntlProvider, FormattedMessage } from "react-intl";
import { messages } from "../../i18n/messages";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Box, Container, Typography, Stack, Divider } from "@mui/material";

type Locale = keyof typeof messages;

export default function PrivacyPage() {
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
                                <Typography variant="overline" sx={{ fontWeight: 900, color: "#10B981", letterSpacing: 4 }}>
                                    LEGAL
                                </Typography>
                                <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: "-0.02em", mt: 1, '.dark &': { color: 'white' } }}>
                                    Privacy Policy
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.5, mt: 2, '.dark &': { color: 'white' } }}>
                                    Last Updated: October 25, 2024
                                </Typography>
                            </Box>

                            <Box sx={{ '.dark &': { color: 'white' } }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>1. Introduction</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.7, lineHeight: 1.8, mb: 4 }}>
                                    Journey-mate ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our platform.
                                </Typography>

                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>2. Information We Collect</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.7, lineHeight: 1.8, mb: 4 }}>
                                    We collect information you provide directly to us, such as when you create an account, post a journey, or communicate with other users. This includes your name, email address, profile picture, and travel details.
                                </Typography>

                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>3. How We Use Your Information</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.7, lineHeight: 1.8, mb: 4 }}>
                                    We use your information to facilitate pairings between travelers and companions, communicate with you about your journeys, and improve our services.
                                </Typography>

                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>4. Sharing of Information</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.7, lineHeight: 1.8, mb: 4 }}>
                                    We share your information with other users only when you explicitly agree to a pairing. We do not sell your personal data to third parties.
                                </Typography>

                                <Divider sx={{ my: 6, opacity: 0.1 }} />

                                <Typography variant="body2" sx={{ opacity: 0.5 }}>
                                    If you have any questions about this Privacy Policy, please contact us at privacy@journey-mate.com.
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
