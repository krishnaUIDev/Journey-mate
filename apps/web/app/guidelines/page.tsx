"use client";

import { useState } from "react";
import { IntlProvider, FormattedMessage } from "react-intl";
import { messages } from "../../i18n/messages";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Box, Container, Typography, Stack, Divider } from "@mui/material";

type Locale = keyof typeof messages;

export default function GuidelinesPage() {
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
                                <Typography variant="overline" sx={{ fontWeight: 900, color: "#EF4444", letterSpacing: 4 }}>
                                    COMMUNITY
                                </Typography>
                                <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: "-0.02em", mt: 1, '.dark &': { color: 'white' } }}>
                                    Community Guidelines
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.5, mt: 2, '.dark &': { color: 'white' } }}>
                                    Stay kind, stay helpful.
                                </Typography>
                            </Box>

                            <Box sx={{ '.dark &': { color: 'white' } }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>1. Be Compassionate</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.7, lineHeight: 1.8, mb: 4 }}>
                                    Remember that many travelers using Journey-mate may be anxious or needing assistance. Always be patient and kind.
                                </Typography>

                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>2. Reliability is Key</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.7, lineHeight: 1.8, mb: 4 }}>
                                    If you commit to being a companion, please show up. If your plans change, notify your paired traveler as soon as possible.
                                </Typography>

                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>3. Respect Privacy</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.7, lineHeight: 1.8, mb: 4 }}>
                                    Don't share others' personal information outside of the journey coordination.
                                </Typography>

                                <Divider sx={{ my: 6, opacity: 0.1 }} />

                                <Typography variant="body2" sx={{ opacity: 0.5 }}>
                                    Violation of these guidelines may result in account suspension.
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
