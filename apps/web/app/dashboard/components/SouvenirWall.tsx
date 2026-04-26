"use client";

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Tooltip,
    Stack
} from '@mui/material';
import {
    Add as AddIcon,
    Image as ImageIcon,
    Note as NoteIcon,
    Delete as DeleteIcon,
    PushPin as PinIcon
} from '@mui/icons-material';
import Image from 'next/image';
import { addSouvenir, getJourneySouvenirs, deleteSouvenir } from '../../actions/souvenirs';
import { supabase } from '../../../lib/supabase';

interface Souvenir {
    id: string;
    journey_id: string;
    user_id: string;
    type: 'photo' | 'note';
    content: string;
    caption?: string;
    created_at: string;
}

interface SouvenirWallProps {
    journeyId: string;
    userId: string;
    isCompanion: boolean;
}

export function SouvenirWall({ journeyId, userId, isCompanion }: SouvenirWallProps) {
    const [souvenirs, setSouvenirs] = useState<Souvenir[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'photo' | 'note'>('photo');
    const [content, setContent] = useState("");
    const [caption, setCaption] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchSouvenirs = async () => {
            const data = await getJourneySouvenirs(journeyId);
            setSouvenirs(data);
            setLoading(false);
        };

        fetchSouvenirs();

        if (!supabase) return;
        const channel = supabase
            .channel(`souvenirs-${journeyId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'journey_souvenirs',
                filter: `journey_id=eq.${journeyId}`
            }, () => {
                fetchSouvenirs();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [journeyId]);

    const handleAdd = async () => {
        if (!content && mode === 'note') return;
        setSubmitting(true);

        let finalContent = content;
        // Mock image if photo mode and no content
        if (mode === 'photo' && !content) {
            const randomId = Math.floor(Math.random() * 1000);
            finalContent = `https://picsum.photos/seed/${randomId}/600/400`;
        }

        try {
            await addSouvenir({
                journey_id: journeyId,
                user_id: userId,
                type: mode,
                content: finalContent,
                caption: caption || undefined
            });
            setOpen(false);
            setContent("");
            setCaption("");
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteSouvenir(id);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>;

    return (
        <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="overline" sx={{ fontWeight: 900, color: 'slate.500', letterSpacing: '0.1em' }}>
                    SOUVENIR WALL
                </Typography>
                {isCompanion && (
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => setOpen(true)}
                        sx={{
                            borderRadius: '1rem',
                            textTransform: 'none',
                            fontWeight: 800,
                            color: '#3B82F6',
                            bgcolor: 'rgba(59, 130, 246, 0.1)',
                            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' }
                        }}
                    >
                        Add Memory
                    </Button>
                )}
            </Box>

            {souvenirs.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '2rem', border: '2px dashed rgba(0,0,0,0.05)', '.dark &': { bgcolor: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.05)' } }}>
                    <Typography sx={{ color: 'slate.400', fontWeight: 700 }}>This wall is empty.</Typography>
                    {isCompanion && <Typography variant="caption" sx={{ color: 'slate.400' }}>Capture a moment or drop a note for your companions!</Typography>}
                </Box>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {souvenirs.map((item) => (
                        <div key={item.id} className="relative group bg-white dark:bg-white/5 p-3 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            {item.type === 'photo' ? (
                                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                                    <Image
                                        src={item.content}
                                        alt={item.caption || "Souvenir"}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-widest">
                                        PHOTO
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-[4/3] bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl p-6 mb-3 flex flex-col justify-center items-center text-center relative overflow-hidden border border-amber-100/50 dark:border-amber-900/20">
                                    <PinIcon sx={{ position: 'absolute', top: 12, right: 12, fontSize: 16, color: 'amber.400', transform: 'rotate(15deg)' }} />
                                    <Typography sx={{
                                        fontFamily: '"Caveat", cursive',
                                        fontSize: '1.25rem',
                                        color: '#92400e',
                                        '.dark &': { color: '#fbbf24' },
                                        fontWeight: 500,
                                        lineHeight: 1.4
                                    }}>
                                        {item.content}
                                    </Typography>
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500/20 rounded-lg text-[8px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                                        NOTE
                                    </div>
                                </div>
                            )}

                            <div className="px-2 pb-1">
                                {item.caption && (
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'slate.600', '.dark &': { color: 'slate.300' }, mb: 0.5, fontSize: '0.8rem' }}>
                                        {item.caption}
                                    </Typography>
                                )}
                                <Typography variant="caption" sx={{ color: 'slate.400', fontWeight: 600, fontSize: '9px' }}>
                                    Posted by a Companion
                                </Typography>
                            </div>

                            {isCompanion && item.user_id === userId && (
                                <IconButton
                                    onClick={() => handleDelete(item.id)}
                                    size="small"
                                    sx={{
                                        position: 'absolute', top: 18, right: 18,
                                        bgcolor: 'rgba(239, 68, 68, 0.9)', color: 'white',
                                        opacity: 0, groupHover: { opacity: 1 }, transition: 'opacity 0.2s',
                                        '&:hover': { bgcolor: '#ef4444' }
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                slotProps={{ paper: { sx: { borderRadius: '2rem', p: 1, width: '100%', maxWidth: 400, '.dark &': { bgcolor: '#18181b', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' } } } }}
            >
                <DialogTitle sx={{ fontWeight: 900, '.dark &': { color: 'white' } }}>Add a Memory</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Button
                            variant={mode === 'photo' ? "contained" : "outlined"}
                            onClick={() => setMode('photo')}
                            startIcon={<ImageIcon />}
                            sx={{ flex: 1, borderRadius: '1rem', textTransform: 'none', fontWeight: 800 }}
                        >
                            Photo
                        </Button>
                        <Button
                            variant={mode === 'note' ? "contained" : "outlined"}
                            onClick={() => setMode('note')}
                            startIcon={<NoteIcon />}
                            sx={{ flex: 1, borderRadius: '1rem', textTransform: 'none', fontWeight: 800 }}
                        >
                            Note
                        </Button>
                    </Box>

                    <Stack spacing={3}>
                        {mode === 'photo' ? (
                            <Box sx={{
                                p: 4, border: '2px dashed rgba(0,0,0,0.1)', borderRadius: '1.5rem',
                                textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)',
                                '.dark &': { borderColor: 'rgba(255,255,255,0.1)', bgcolor: 'rgba(255,255,255,0.02)' }
                            }}>
                                <ImageIcon sx={{ fontSize: 40, color: 'slate.300', mb: 1 }} />
                                <Typography variant="caption" sx={{ color: 'slate.500', display: 'block', fontWeight: 700 }}>
                                    Photo uploads coming soon!<br />
                                    <span className="text-[10px]">Adding a random travel photo for now.</span>
                                </Typography>
                            </Box>
                        ) : (
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                placeholder="Write something memorable..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                slotProps={{ input: { sx: { borderRadius: '1rem' } } }}
                            />
                        )}
                        <TextField
                            fullWidth
                            placeholder="Add a caption..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            slotProps={{ input: { sx: { borderRadius: '1rem' } } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setOpen(false)} sx={{ fontWeight: 900, color: 'slate.500' }}>Cancel</Button>
                    <Button
                        onClick={handleAdd}
                        disabled={submitting || (mode === 'note' && !content)}
                        variant="contained"
                        sx={{
                            borderRadius: '1rem',
                            fontWeight: 900,
                            px: 4,
                            bgcolor: '#3B82F6',
                            '&:hover': { bgcolor: '#2563EB' }
                        }}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : "Post to Wall"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
