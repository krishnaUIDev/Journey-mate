"use client";

import { useEffect, useState } from "react";
import { IntlProvider, FormattedMessage } from "react-intl";
import { messages } from "../../i18n/messages";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Box, Container, Typography, Grid, Paper, Stack, Avatar, Chip, Button, CircularProgress } from "@mui/material";
import { Star as StarIcon, Verified as VerifiedIcon, Search as SearchIcon, Language as LanguageIcon } from "@mui/icons-material";
import { supabase } from "../../lib/supabase";

type Locale = keyof typeof messages;

interface CompanionProfile {
    id: string;
    username: string;
    avatar_url: string;
    avg_rating: number;
    review_count: number;
    languages: string[];
    specialty: string;
    is_verified: boolean;
}

export default function CompanionsPage() {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [locale, setLocale] = useState<Locale>("en");
    const [profiles, setProfiles] = useState<CompanionProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfiles() {
            try {
                if (!supabase) return;
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('is_verified', true)
                    .order('avg_rating', { ascending: false })
                    .limit(6);

                if (error) throw error;
                if (data) setProfiles(data);
            } catch (err) {
                console.error("Error fetching companion profiles:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProfiles();
    }, []);

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

                <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'rgba(59,130,246,0.02)' }}>
                    <Container maxWidth="lg">
                        <Stack spacing={2} sx={{ mb: 5, textAlign: 'center', alignItems: 'center' }}>
                            <Typography variant="overline" sx={{ fontWeight: 900, color: "#3B82F6", letterSpacing: 4, width: '100%' }}>
                                <FormattedMessage id="companions.header.badge" />
                            </Typography>
                            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: "-0.01em", '.dark &': { color: 'white' }, width: '100%' }}>
                                <FormattedMessage id="companions.header.title" />
                            </Typography>
                            <Typography variant="h6" sx={{ maxWidth: 700, opacity: 0.6, fontWeight: 500, lineHeight: 1.5, '.dark &': { color: 'white' } }}>
                                <FormattedMessage id="companions.header.desc" />
                            </Typography>
                        </Stack>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                                <CircularProgress color="primary" />
                            </Box>
                        ) : profiles.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 10 }}>
                                <Typography variant="h6" sx={{ opacity: 0.5, '.dark &': { color: 'white' } }}>
                                    No verified companions found. Check back soon!
                                </Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={4}>
                                {profiles.map((mate) => (
                                    <Grid size={{ xs: 12, md: 4 }} key={mate.id}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 4,
                                                borderRadius: '2.5rem',
                                                bgcolor: 'white',
                                                border: '1px solid rgba(0,0,0,0.05)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-10px)',
                                                    boxShadow: '0 30px 60px rgba(0,0,0,0.08)'
                                                },
                                                '.dark &': {
                                                    bgcolor: 'rgba(255,255,255,0.02)',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    color: 'white'
                                                }
                                            }}
                                        >
                                            <Stack spacing={3} sx={{ alignItems: 'center' }}>
                                                <Box sx={{ position: 'relative' }}>
                                                    <Avatar
                                                        src={mate.avatar_url || `https://i.pravatar.cc/150?u=${mate.id}`}
                                                        sx={{ width: 120, height: 120, border: '4px solid white', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', '.dark &': { borderColor: '#1e293b' } }}
                                                    />
                                                    {mate.is_verified && (
                                                        <VerifiedIcon
                                                            sx={{
                                                                position: 'absolute', bottom: 5, right: 5,
                                                                bgcolor: 'white', borderRadius: '50%', color: '#10B981', fontSize: 32,
                                                                '.dark &': { bgcolor: '#1e293b' }
                                                            }}
                                                        />
                                                    )}
                                                </Box>

                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Typography variant="h5" sx={{ fontWeight: 900 }}>{mate.username || 'Traveler'}</Typography>
                                                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', alignItems: 'center', mt: 0.5 }}>
                                                        <StarIcon sx={{ color: '#FCD34D', fontSize: 18 }} />
                                                        <Typography variant="body2" sx={{ fontWeight: 900 }}>{mate.avg_rating?.toFixed(1) || '0.0'}</Typography>
                                                        <Typography variant="caption" sx={{ opacity: 0.5 }}>({mate.review_count || 0} reviews)</Typography>
                                                    </Stack>
                                                </Box>

                                                {mate.languages && mate.languages.length > 0 && (
                                                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                                                        {mate.languages.slice(0, 3).map((lang, lIdx) => (
                                                            <Chip
                                                                key={lIdx}
                                                                icon={<LanguageIcon sx={{ fontSize: '1rem !important' }} />}
                                                                label={lang}
                                                                size="small"
                                                                sx={{ fontWeight: 700, bgcolor: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}
                                                            />
                                                        ))}
                                                    </Stack>
                                                )}

                                                <Chip label={mate.specialty || 'General'} sx={{ fontWeight: 800, bgcolor: '#0f172a', color: 'white', borderRadius: '0.75rem', '.dark &': { bgcolor: 'rgba(255,255,255,0.1)' } }} />

                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    sx={{
                                                        borderRadius: '1.25rem', py: 1.5, fontWeight: 900,
                                                        borderColor: 'rgba(0,0,0,0.1)', color: 'text.primary',
                                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.2)' },
                                                        '.dark &': { color: 'white', borderColor: 'rgba(255,255,255,0.1)' }
                                                    }}
                                                >
                                                    View Profile
                                                </Button>
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        <Box sx={{ mt: 6, textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<SearchIcon />}
                                sx={{
                                    bgcolor: '#3B82F6', px: 6, py: 2.5, borderRadius: '2rem',
                                    fontWeight: 900, textTransform: 'none', fontSize: '1.1rem',
                                    '&:hover': { bgcolor: '#2563EB' }
                                }}
                            >
                                Browse All Mates
                            </Button>
                        </Box>
                    </Container>
                </Box>

                <Footer theme={theme} />
            </main>
        </IntlProvider>
    );
}
