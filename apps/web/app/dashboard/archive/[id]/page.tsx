"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Box,
    Typography,
    Container,
    Paper,
    Grid,
    Avatar,
    AvatarGroup,
    Divider,
    IconButton,
    Button,
    Card,
    CardMedia,
    Stack,
    CircularProgress
} from "@mui/material";
import {
    ArrowBack as BackIcon,
    CameraAlt as PhotoIcon,
    ReceiptLong as ExpenseIcon,
    FlightTakeoff as FlightIcon,
    Favorite as HeartIcon,
    Star as StarIcon,
    Share as ShareIcon
} from "@mui/icons-material";
import { useMessages, Message, JourneyRequest } from "../../../../context/MessagesContext";
import { useJourneys } from "../../../../context/JourneysContext";
import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";

export default function JourneyArchivePage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useUser();
    const { getExpenses, messages, getRequests, getSouvenirs, addSouvenir, uploadChatImage } = useMessages();
    const { journeys } = useJourneys();

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [journey, setJourney] = useState<any>(null);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [participants, setParticipants] = useState<JourneyRequest[]>([]);
    const [souvenirs, setSouvenirs] = useState<any[]>([]);
    const [photos, setPhotos] = useState<string[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            const j = journeys.find((item: any) => item.id === id);
            if (!j) {
                router.push("/dashboard");
                return;
            }
            setJourney(j);

            // Fetch expenses
            const exps = await getExpenses(id as string);
            setExpenses(exps);

            // Fetch participants
            const reqs = await getRequests(id as string);
            setParticipants((reqs || []).filter((r: JourneyRequest) => r.status === 'accepted'));

            // Fetch souvenirs
            const souvs = await getSouvenirs(id as string);
            setSouvenirs(souvs);

            // Extract photos from chat messages
            const chatPhotos = messages
                .filter((m: Message) => m.journey_id === id && m.image_url)
                .map((m: Message) => m.image_url as string);
            setPhotos(chatPhotos);

            setLoading(false);
        };
        loadData();
    }, [id, journeys, messages, getExpenses, getRequests, getSouvenirs, router]);

    const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !id) return;

        setUploading(true);
        try {
            const url = await uploadChatImage(file);
            if (url) {
                await addSouvenir(id as string, url, "Journey Memory");
                const freshSouvs = await getSouvenirs(id as string);
                setSouvenirs(freshSouvs);
            }
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    const totalSpent = expenses.filter(e => !e.is_settlement).reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const squadCount = participants.length + 1;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 10, px: 2, '.dark &': { bgcolor: '#0f172a' } }}>
            {/* Header */}
            <Box sx={{ pt: 4, pb: 6, textAlign: 'center', position: 'relative' }}>
                <IconButton
                    onClick={() => router.back()}
                    sx={{ position: 'absolute', left: 0, top: 32, bgcolor: 'white', boxShadow: 1, '.dark &': { bgcolor: '#1e293b', color: 'white' } }}
                >
                    <BackIcon />
                </IconButton>
                <Typography variant="overline" sx={{ fontWeight: 900, color: '#10B981', letterSpacing: '2px' }}>
                    JOURNEY SOUVENIR
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em', '.dark &': { color: 'white' } }}>
                    {journey.destination}
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.6, fontWeight: 700, '.dark &': { color: 'slate.400' } }}>
                    {dayjs(journey.date).format('MMMM D, YYYY')} • Completed Journey
                </Typography>
            </Box>

            <Container maxWidth="md">
                <Grid container spacing={4}>
                    {/* Squad Card */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 4, borderRadius: '2rem', height: '100%', bgcolor: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', '.dark &': { bgcolor: '#1e293b', backgroundImage: 'none' } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <PhotoIcon sx={{ color: '#10B981' }} />
                                <Typography variant="h6" sx={{ fontWeight: 900, '.dark &': { color: 'white' } }}>The Squad</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                                <AvatarGroup max={4}>
                                    <Avatar
                                        src={journey.user.avatar}
                                        alt={journey.user.name}
                                        sx={{ width: 56, height: 56, border: '4px solid white !important', '.dark &': { borderColor: '#1e293b !important' } }}
                                    />
                                    {participants
                                        .filter(p => p.requester_id !== journey.userId)
                                        .map((p, i) => (
                                            <Avatar
                                                key={i}
                                                src={p.requester_avatar}
                                                alt={p.requester_name}
                                                sx={{ width: 56, height: 56, border: '4px solid white !important', '.dark &': { borderColor: '#1e293b !important' } }}
                                            />
                                        ))
                                    }
                                </AvatarGroup>
                                <Box sx={{ '.dark &': { color: 'white' } }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{squadCount} Travelers</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>Successfully landed together</Typography>
                                </Box>
                            </Box>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '1rem', '.dark &': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                    <Typography variant="body2" sx={{ fontWeight: 800, '.dark &': { color: 'slate.300' } }}>Vibe Score</Typography>
                                    <Stack direction="row" spacing={0.5}>
                                        {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} sx={{ fontSize: 16, color: '#eab308' }} />)}
                                    </Stack>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '1rem', '.dark &': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                    <Typography variant="body2" sx={{ fontWeight: 800, '.dark &': { color: 'slate.300' } }}>Safety Rating</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#10B981' }}>ELITE</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Financial Summary */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 4, borderRadius: '2rem', height: '100%', bgcolor: '#0f172a', color: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <ExpenseIcon sx={{ color: '#FCD34D' }} />
                                <Typography variant="h6" sx={{ fontWeight: 900 }}>Financial Insight</Typography>
                            </Box>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 800, letterSpacing: '1px' }}>TOTAL SQUAD SPEND</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 900 }}>${totalSpent.toFixed(2)}</Typography>
                            </Box>
                            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 3 }} />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 800, display: 'block' }}>YOUR SHARE</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 900 }}>${(totalSpent / squadCount).toFixed(2)}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 800, display: 'block' }}>EXPENSES</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 900 }}>{expenses.length} Records</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Photo Gallery */}
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 900, '.dark &': { color: 'white' } }}>Shared Moments</Typography>
                            <Button
                                component="label"
                                variant="outlined"
                                disabled={uploading}
                                startIcon={uploading ? <CircularProgress size={16} /> : <PhotoIcon />}
                                sx={{ borderRadius: '1rem', fontWeight: 700, borderColor: 'rgba(0,0,0,0.1)', color: 'text.secondary', '.dark &': { color: 'white', borderColor: 'rgba(255,255,255,0.1)' } }}
                            >
                                {uploading ? 'Uploading...' : 'Add Memory'}
                                <input type="file" hidden accept="image/*" onChange={handleUploadPhoto} />
                            </Button>
                        </Box>
                        {photos.length === 0 && souvenirs.length === 0 ? (
                            <Box sx={{ py: 10, textAlign: 'center', border: '2px dashed rgba(0,0,0,0.1)', borderRadius: '2rem', '.dark &': { borderColor: 'rgba(255,255,255,0.1)' } }}>
                                <PhotoIcon sx={{ fontSize: 48, opacity: 0.2, mb: 2, '.dark &': { color: 'white' } }} />
                                <Typography variant="body2" sx={{ opacity: 0.5, fontWeight: 700, '.dark &': { color: 'white' } }}>No photos were captured during this journey.</Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {[...souvenirs.map(s => s.image_url), ...photos].map((url, i) => (
                                    <Grid size={{ xs: 6, md: 3 }} key={i}>
                                        <Card sx={{ borderRadius: '1.5rem', boxShadow: 3, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}>
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={url}
                                                alt={`Journey moment ${i + 1}`}
                                                sx={{ objectFit: 'cover' }}
                                            />
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Grid>

                    {/* Final Action */}
                    <Grid size={{ xs: 12 }} sx={{ textAlign: 'center', mt: 4 }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<ShareIcon />}
                            sx={{
                                borderRadius: '1rem',
                                px: 6,
                                py: 2,
                                fontWeight: 900,
                                bgcolor: '#10B981',
                                '&:hover': { bgcolor: '#059669' }
                            }}
                        >
                            Share Memory
                        </Button>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
