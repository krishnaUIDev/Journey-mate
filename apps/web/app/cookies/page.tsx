"use client";

import { useState } from "react";
import { IntlProvider, FormattedMessage } from "react-intl";
import { messages } from "../../i18n/messages";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Box, Container, Typography, Stack, Divider } from "@mui/material";

type Locale = keyof typeof messages;

export default function CookiesPage() {
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
                                <Typography variant="overline" sx={{ fontWeight: 900, color: "#8B5CF6", letterSpacing: 4 }}>
                                    LEGAL
                                </Typography>
                                <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: "-0.02em", mt: 1, '.dark &': { color: 'white' } }}>
                                    Cookie Policy
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.5, mt: 2, '.dark &': { color: 'white' } }}>
                                    Last Updated: October 25, 2024
                                </Typography>
                            </Box>

                            <Box sx={{ '.dark &': { color: 'white' } }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>What are cookies?</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.7, lineHeight: 1.8, mb: 4 }}>
                                    Cookies are small text files stored on your device to help us provide a better experience. We use them for authentication, remembers your preferences, and analyzing platform usage.
                                </Typography>

                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>How we use them</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.7, lineHeight: 1.8, mb: 4 }}>
                                    We use essential cookies to keep you signed in via Clerk, and preference cookies to remember your language and theme choices.
                                </Typography>

                                <Divider sx={{ my: 6, opacity: 0.1 }} />

                                <Typography variant="body2" sx={{ opacity: 0.5 }}>
                                    Managing Cookies: You can disable cookies in your browser settings, but it may affect account functionality.
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
