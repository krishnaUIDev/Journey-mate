"use client";

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Stack,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    LocationOn as LocationIcon,
    AutoFixHigh as MagicIcon
} from '@mui/icons-material';
import { useUser } from '@clerk/nextjs';
import { createBlogPost } from '../../actions/blog';

interface AddBlogPostModalProps {
    open: boolean;
    onClose: () => void;
}

export function AddBlogPostModal({ open, onClose }: AddBlogPostModalProps) {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [category, setCategory] = useState("Discovery");
    const [locationLabel, setLocationLabel] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");

    const handleSubmit = async () => {
        if (!user || !title || !content) return;

        setLoading(true);
        try {
            await createBlogPost({
                title,
                excerpt,
                content,
                image_url: imageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800",
                author_id: user.id,
                author_name: user.fullName || user.username || "Traveler",
                author_avatar: user.imageUrl,
                category,
                location_label: locationLabel,
                location_coords: (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined
            });
            onClose();
            // Reset form
            setTitle("");
            setExcerpt("");
            setContent("");
            setImageUrl("");
            setLocationLabel("");
            setLat("");
            setLng("");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '2.5rem',
                        p: 1,
                        '.dark &': { bgcolor: '#18181b', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' }
                    }
                }
            }}
        >
            <DialogTitle sx={{ fontWeight: 900, p: 4, pb: 2, '.dark &': { color: 'white' } }}>
                Write Your Story
                <Typography variant="body2" sx={{ color: 'slate.500', fontWeight: 600, mt: 0.5 }}>
                    Share your travel insights and help fellow companions explore.
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
                <Stack spacing={4}>
                    <TextField
                        label="Story Title"
                        placeholder="e.g. Hidden Temples of Kyoto"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        slotProps={{ input: { sx: { borderRadius: '1.25rem', fontWeight: 700 } } }}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={category}
                                label="Category"
                                onChange={(e) => setCategory(e.target.value)}
                                sx={{ borderRadius: '1.25rem' }}
                            >
                                <MenuItem value="Discovery">Discovery</MenuItem>
                                <MenuItem value="Lifestyle">Lifestyle</MenuItem>
                                <MenuItem value="Safety">Safety</MenuItem>
                                <MenuItem value="Guides">Guides</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Cover Image URL (Optional)"
                            placeholder="https://..."
                            fullWidth
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            slotProps={{ input: { sx: { borderRadius: '1.25rem' } } }}
                        />
                    </div>

                    <TextField
                        label="Short Excerpt"
                        placeholder="A brief summary for the feed card..."
                        fullWidth
                        multiline
                        rows={2}
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        slotProps={{ input: { sx: { borderRadius: '1.25rem' } } }}
                    />

                    <TextField
                        label="Story Content"
                        placeholder="Write your story here... (Markdown supported)"
                        fullWidth
                        multiline
                        rows={8}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        slotProps={{ input: { sx: { borderRadius: '1.5rem', lineHeight: 1.6 } } }}
                    />

                    <Box sx={{ p: 3, bgcolor: 'slate.50', borderRadius: '1.5rem', border: '1px dashed rgba(0,0,0,0.1)', '.dark &': { bgcolor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' } }}>
                        <Typography sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.8rem', color: 'slate.600', '.dark &': { color: 'slate.400' } }}>
                            <LocationIcon sx={{ fontSize: 16 }} /> MAP ORIENTATION (OPTIONAL)
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <TextField
                                label="Location Name"
                                placeholder="Tokyo, Japan"
                                size="small"
                                value={locationLabel}
                                onChange={(e) => setLocationLabel(e.target.value)}
                                sx={{ flex: 2 }}
                                slotProps={{ input: { sx: { borderRadius: '1rem' } } }}
                            />
                            <TextField
                                label="Latitude"
                                placeholder="35.6762"
                                size="small"
                                value={lat}
                                onChange={(e) => setLat(e.target.value)}
                                slotProps={{ input: { sx: { borderRadius: '1rem' } } }}
                            />
                            <TextField
                                label="Longitude"
                                placeholder="139.6503"
                                size="small"
                                value={lng}
                                onChange={(e) => setLng(e.target.value)}
                                slotProps={{ input: { sx: { borderRadius: '1rem' } } }}
                            />
                        </div>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 4, pt: 0 }}>
                <Button onClick={onClose} sx={{ fontWeight: 900, color: 'slate.500' }}>Discard</Button>
                <Button
                    onClick={handleSubmit}
                    disabled={loading || !title || !content}
                    variant="contained"
                    sx={{
                        borderRadius: '2rem',
                        px: 6,
                        py: 1.5,
                        fontWeight: 900,
                        bgcolor: '#3B82F6',
                        textTransform: 'none',
                        boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)',
                        '&:hover': { bgcolor: '#2563EB' }
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Publish Story"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
