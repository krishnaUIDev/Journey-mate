"use client";

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Avatar,
    ToggleButtonGroup,
    ToggleButton,
    CircularProgress
} from '@mui/material';
import {
    SentimentVerySatisfied as PositiveIcon,
    SentimentNeutral as NeutralIcon,
    SentimentVeryDissatisfied as NegativeIcon,
    Star as KudosIcon
} from '@mui/icons-material';
import { submitKudos } from '../../actions/kudos';
import { AutoFixHigh as MagicIcon } from '@mui/icons-material';
import { Tooltip, IconButton, CircularProgress as TinyProgress } from '@mui/material';

interface KudosModalProps {
    open: boolean;
    onClose: () => void;
    journeyId: string;
    revieweeId: string;
    revieweeName: string;
    revieweeAvatar: string;
    reviewerId: string;
}

export function KudosModal({ open, onClose, journeyId, revieweeId, revieweeName, revieweeAvatar, reviewerId }: KudosModalProps) {
    const [content, setContent] = useState("");
    const [type, setType] = useState<'positive' | 'neutral' | 'negative'>('positive');
    const [submitting, setSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAISuggest = async () => {
        setIsGenerating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600)); // Simulated thinking time
            const firstName = (revieweeName || 'Traveler').split(' ')[0];

            let draft = "";
            if (type === 'positive') {
                const options = [
                    `${firstName} was an amazing companion! Super helpful and punctual.`,
                    `Great trip with ${firstName}! Really enjoyed our conversations.`,
                    `${firstName} made the journey so much easier. Highly recommend!`
                ];
                draft = options[Math.floor(Math.random() * options.length)] || '';
            } else if (type === 'neutral') {
                const options = [
                    `${firstName} was a polite and quiet companion.`,
                    `Simple and smooth journey with ${firstName}.`,
                    `Everything went fine with ${firstName}.`
                ];
                draft = options[Math.floor(Math.random() * options.length)] || '';
            } else {
                const options = [
                    `Had some minor coordination issues with ${firstName}.`,
                    `Journey with ${firstName} could have been smoother.`,
                    `Punctuality was a bit of an issue on this trip.`
                ];
                draft = options[Math.floor(Math.random() * options.length)] || '';
            }
            setContent(draft);
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setError(null);
        setSubmitting(true);
        try {
            await submitKudos({
                reviewer_id: reviewerId,
                reviewee_id: revieweeId,
                journey_id: journeyId,
                content: content.trim(),
                type
            });
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to submit kudos.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{ paper: { sx: { borderRadius: '2rem', p: 1, width: '100%', maxWidth: 400, '.dark &': { bgcolor: '#18181b', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' } } } }}
        >
            <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1, '.dark &': { color: 'white' } }}>
                <KudosIcon sx={{ color: '#fbbf24' }} /> Leave Kudos
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 3, opacity: 0.7, '.dark &': { color: 'slate.300' } }}>
                    Share your experience with <b>{revieweeName}</b> to help the community build trust.
                </Typography>

                {error && (
                    <Box sx={{
                        mb: 3,
                        p: 2,
                        borderRadius: '1rem',
                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textAlign: 'center'
                    }}>
                        {error}
                    </Box>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, mb: 3 }}>
                    <Avatar src={revieweeAvatar} sx={{ width: 64, height: 64, border: '3px solid #fbbf24' }} />

                    <ToggleButtonGroup
                        value={type}
                        exclusive
                        onChange={(_, val) => val && setType(val)}
                        sx={{
                            gap: 1,
                            '& .MuiToggleButton-root': {
                                borderRadius: '1.25rem !important',
                                border: '1px solid rgba(0,0,0,0.08) !important',
                                '.dark &': {
                                    borderColor: 'rgba(255,255,255,0.1) !important',
                                    color: 'white'
                                },
                                px: 2.5,
                                py: 1.2,
                                fontSize: '0.75rem',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.03)',
                                    '.dark &': { bgcolor: 'rgba(255,255,255,0.03)' }
                                }
                            },
                            '& .Mui-selected': {
                                bgcolor: 'rgba(251, 191, 36, 0.1) !important',
                                color: '#fbbf24 !important',
                                borderColor: '#fbbf24 !important',
                                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.2)'
                            }
                        }}
                    >
                        <ToggleButton value="positive"><PositiveIcon sx={{ mr: 1 }} /> Great</ToggleButton>
                        <ToggleButton value="neutral"><NeutralIcon sx={{ mr: 1 }} /> OK</ToggleButton>
                        <ToggleButton value="negative"><NegativeIcon sx={{ mr: 1 }} /> Tough</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="e.g. Super helpful with bags and great company during the layover!"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    variant="outlined"
                    slotProps={{
                        input: {
                            sx: {
                                borderRadius: '1.25rem',
                                bgcolor: 'rgba(0,0,0,0.02)',
                                '.dark &': { bgcolor: 'rgba(255,255,255,0.03)', color: 'white' },
                                pr: 6
                            },
                            endAdornment: (
                                <Tooltip title="AI Draft">
                                    <IconButton
                                        size="small"
                                        onClick={handleAISuggest}
                                        disabled={isGenerating}
                                        sx={{
                                            position: 'absolute',
                                            right: 8,
                                            color: '#0ea5e9',
                                            bgcolor: 'rgba(14, 165, 233, 0.05)',
                                            '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.1)' }
                                        }}
                                    >
                                        {isGenerating ? <TinyProgress size={18} color="inherit" /> : <MagicIcon sx={{ fontSize: 20 }} />}
                                    </IconButton>
                                </Tooltip>
                            )
                        }
                    }}
                />
            </DialogContent>
            <Box sx={{ px: 3, pb: 4, pt: 1, display: 'flex', gap: 2, width: '100%', boxSizing: 'border-box' }}>
                <Button
                    fullWidth
                    onClick={onClose}
                    sx={{
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontSize: '0.75rem',
                        color: 'slate.500',
                        py: 2,
                        borderRadius: '1.25rem',
                        bgcolor: 'rgba(0,0,0,0.04)',
                        '.dark &': {
                            color: 'slate.400',
                            bgcolor: 'rgba(255,255,255,0.04)'
                        },
                        '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.08)',
                            '.dark &': { bgcolor: 'rgba(255,255,255,0.08)' }
                        },
                        transition: 'all 0.2s'
                    }}
                >
                    Skip
                </Button>
                <Button
                    fullWidth
                    onClick={handleSubmit}
                    disabled={submitting || !content.trim()}
                    variant="contained"
                    sx={{
                        borderRadius: '1.25rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontSize: '0.75rem',
                        py: 2,
                        bgcolor: '#fbbf24',
                        color: '#000',
                        '.dark &': {
                            bgcolor: '#fbbf24',
                            color: '#000',
                        },
                        '&.Mui-disabled': {
                            bgcolor: 'rgba(0,0,0,0.05)',
                            '.dark &': { bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' }
                        },
                        transition: 'all 0.2s',
                        boxShadow: '0 10px 20px -5px rgba(251, 191, 36, 0.3)',
                        '&:hover': {
                            bgcolor: '#f59e0b',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 15px 25px -5px rgba(251, 191, 36, 0.4)'
                        },
                        '&:active': { transform: 'translateY(0)' }
                    }}
                >
                    {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit Kudos"}
                </Button>
            </Box>
        </Dialog>
    );
}
