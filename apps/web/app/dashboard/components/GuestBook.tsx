"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, Stack, Avatar, Modal, TextField, IconButton, Chip, Tooltip } from "@mui/material";
import { Create as CreateIcon, Close as CloseIcon } from "@mui/icons-material";
import { submitGuestbookEntry, getJourneyGuestbook } from "../../actions/guestbook";
import { suggestEmoji, generateDraft } from "../../../lib/sentiment";

interface GuestbookEntry {
    id: string;
    author_id: string;
    author_name: string;
    author_avatar?: string;
    content: string;
    emotion?: string;
    created_at: string;
}

interface GuestBookProps {
    journeyId: string;
    currentUser: { id: string; name: string; avatar?: string };
    isParticipant: boolean;
}

const EMOTIONS = ["💖", "🤝", "✈️", "☕", "📸", "🌏", "✨"];

export default function GuestBook({ journeyId, currentUser, isParticipant }: GuestBookProps) {
    const [entries, setEntries] = useState<GuestbookEntry[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [content, setContent] = useState("");
    const [emotion, setEmotion] = useState("✨");
    const [wasAutoSuggested, setWasAutoSuggested] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchEntries();
    }, [journeyId]);

    const fetchEntries = async () => {
        const data = await getJourneyGuestbook(journeyId);
        setEntries(data as GuestbookEntry[]);
    };

    // AI suggestion logic
    useEffect(() => {
        if (content.trim().length > 3) {
            const suggested = suggestEmoji(content);
            if (suggested !== emotion) {
                setEmotion(suggested);
                setWasAutoSuggested(true);
            }
        }
    }, [content]);

    const handleEmotionClick = (e: string) => {
        setEmotion(e);
        setWasAutoSuggested(false);
    };

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setIsSubmitting(true);
        try {
            await submitGuestbookEntry({
                journey_id: journeyId,
                author_id: currentUser.id,
                author_name: currentUser.name,
                author_avatar: currentUser.avatar,
                content,
                emotion
            });
            setContent("");
            setEmotion("✨");
            setIsModalOpen(false);
            fetchEntries();
        } catch (error) {
            console.error("Guestbook submission failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 900, '.dark &': { color: 'white' } }}>
                    Journey Guest Book
                </Typography>
                {isParticipant && (
                    <Button
                        variant="contained"
                        onClick={() => setIsModalOpen(true)}
                        sx={{
                            borderRadius: '2rem',
                            fontWeight: 900,
                            textTransform: 'none',
                            bgcolor: '#3B82F6',
                            px: 2,
                            py: 0.5,
                            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                bgcolor: '#2563EB',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 6px 20px rgba(0,118,255,0.23)',
                            },
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center'
                        }}
                    >
                        <CreateIcon sx={{ fontSize: 16 }} />
                        <Typography variant="button" sx={{ fontWeight: 900, fontSize: '0.7rem' }}>
                            Sign Scrapbook
                        </Typography>
                    </Button>
                )}
            </Stack>

            {entries.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: '2rem',
                        bgcolor: 'rgba(0,0,0,0.02)',
                        border: '1px dashed rgba(0,0,0,0.1)',
                        '.dark &': { bgcolor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }
                    }}
                >
                    <Typography variant="body1" sx={{ opacity: 0.5, '.dark &': { color: 'white' } }}>
                        No reflections yet. Be the first to leave a message.
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {entries.map((entry) => (
                        <Paper
                            key={entry.id}
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: '1.50rem',
                                bgcolor: 'white',
                                border: '1px solid rgba(0,0,0,0.05)',
                                position: 'relative',
                                transition: 'all 0.3s ease',
                                '&:hover': { transform: 'rotate(-0.5deg)', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' },
                                '.dark &': { bgcolor: '#1e293b', borderColor: 'rgba(255,255,255,0.05)' }
                            }}
                        >
                            <Box sx={{ position: 'absolute', top: 12, right: 16, fontSize: '1.5rem' }}>
                                {entry.emotion}
                            </Box>
                            <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
                                <Avatar src={entry.author_avatar} sx={{ width: 32, height: 32 }} />
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, '.dark &': { color: 'white' } }}>
                                        {entry.author_name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.5, '.dark &': { color: 'white' } }}>
                                        {new Date(entry.created_at).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#4b5563', lineHeight: 1.6, '.dark &': { color: 'rgba(255,255,255,0.8)' } }}>
                                "{entry.content}"
                            </Typography>
                        </Paper>
                    ))}
                </Stack>
            )}

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 450 },
                    bgcolor: 'background.paper',
                    borderRadius: '2rem', p: 4,
                    boxShadow: 24,
                    '.dark &': { bgcolor: '#0f172a' }
                }}>
                    <Stack spacing={3}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 900, '.dark &': { color: 'white' } }}>Add a Reflection</Typography>
                            <IconButton onClick={() => setIsModalOpen(false)} sx={{ '.dark &': { color: 'white' } }}><CloseIcon /></IconButton>
                        </Box>

                        <TextField
                            multiline
                            rows={4}
                            fullWidth
                            placeholder="What will you remember most about this journey?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            variant="outlined"
                            slotProps={{
                                input: {
                                    sx: {
                                        borderRadius: '1.5rem',
                                        px: 1,
                                        '.dark &': { color: 'white', bgcolor: 'rgba(255,255,255,0.03)' }
                                    },
                                    endAdornment: (
                                        <Tooltip title="Magic Draft Reflection">
                                            <IconButton
                                                onClick={() => {
                                                    const draft = generateDraft();
                                                    setContent(draft);
                                                }}
                                                sx={{
                                                    color: '#3B82F6',
                                                    bgcolor: 'rgba(59,130,246,0.05)',
                                                    '&:hover': { bgcolor: 'rgba(59,130,246,0.1)' }
                                                }}
                                            >
                                                <CreateIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Tooltip>
                                    )
                                }
                            }}
                        />

                        <Box>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, '.dark &': { color: 'white' } }}>Choose your vibe:</Typography>
                                {wasAutoSuggested && (
                                    <Typography variant="caption" sx={{ color: '#3B82F6', fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                                        ✨ Recommended
                                    </Typography>
                                )}
                            </Stack>
                            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>
                                {EMOTIONS.map((e) => (
                                    <Chip
                                        key={e}
                                        label={e}
                                        onClick={() => handleEmotionClick(e)}
                                        variant={emotion === e ? "filled" : "outlined"}
                                        sx={{
                                            fontSize: '1.2rem', p: 1, height: 40,
                                            transition: 'all 0.2s ease',
                                            borderColor: emotion === e ? '#3B82F6' : 'rgba(0,0,0,0.1)',
                                            bgcolor: emotion === e ? 'rgba(59,130,246,0.1)' : 'transparent',
                                            transform: (wasAutoSuggested && emotion === e) ? 'scale(1.1)' : 'scale(1)',
                                            borderWidth: (wasAutoSuggested && emotion === e) ? 2 : 1,
                                            '.dark &': {
                                                borderColor: emotion === e ? '#3B82F6' : 'rgba(255,255,255,0.1)',
                                                color: 'white'
                                            }
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            disabled={!content.trim() || isSubmitting}
                            onClick={handleSubmit}
                            sx={{
                                borderRadius: '1rem', py: 2, fontWeight: 900, bgcolor: '#3B82F6',
                                '&:hover': { bgcolor: '#2563EB' }
                            }}
                        >
                            {isSubmitting ? "Preserving..." : "Preserve Reflection"}
                        </Button>
                    </Stack>
                </Box>
            </Modal>
        </Box>
    );
}
