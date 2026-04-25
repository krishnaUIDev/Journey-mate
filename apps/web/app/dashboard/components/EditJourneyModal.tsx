"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { AirportAutocomplete } from "./AirportAutocomplete";
import { JourneyPost, useJourneys } from "../../../context/JourneysContext";

interface EditJourneyModalProps {
    open: boolean;
    onClose: () => void;
    journey: JourneyPost;
}

export function EditJourneyModal({ open, onClose, journey }: EditJourneyModalProps) {
    const { updateJourney } = useJourneys();
    const [submitting, setSubmitting] = useState(false);

    const [from, setFrom] = useState(journey.from);
    const [to, setTo] = useState(journey.to);
    const [date, setDate] = useState<Dayjs | null>(dayjs(journey.date));
    const [flightNumber, setFlightNumber] = useState(journey.flightNumber || "");
    const [description, setDescription] = useState(journey.description);
    const [contactInfo, setContactInfo] = useState(journey.contactInfo || "");
    const [status, setStatus] = useState<'upcoming' | 'ongoing' | 'completed' | 'cancelled'>(journey.status);

    useEffect(() => {
        if (open) {
            setFrom(journey.from);
            setTo(journey.to);
            setDate(dayjs(journey.date));
            setFlightNumber(journey.flightNumber || "");
            setDescription(journey.description);
            setContactInfo(journey.contactInfo || "");
            setStatus(journey.status);
        }
    }, [open, journey]);

    const handleSubmit = async () => {
        if (!from || !to || !date || !description) {
            alert("Please fill in all required fields.");
            return;
        }

        setSubmitting(true);
        try {
            await updateJourney(journey.id, {
                from,
                to,
                date: date.format('YYYY-MM-DD'),
                flightNumber,
                description,
                contactInfo,
                status,
            });
            onClose();
        } catch (err) {
            console.error("Error updating journey:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '2rem',
                        p: 2,
                        bgcolor: 'background.paper',
                        backgroundImage: 'none',
                        '.dark &': { bgcolor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }
                    }
                }
            }}
        >
            <DialogTitle component="div" sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="span" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                    Edit Trip Details
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <AirportAutocomplete
                            label="From"
                            placeholder="Origin"
                            value={from}
                            onChange={setFrom}
                        />
                        <AirportAutocomplete
                            label="To"
                            placeholder="Destination"
                            value={to}
                            onChange={setTo}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', ml: 1, mb: 0.5, display: 'block', fontSize: '10px' }}>
                                Travel Date
                            </Typography>
                            <DatePicker
                                value={date}
                                onChange={(val) => setDate(val)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        variant: 'standard',
                                        slotProps: {
                                            input: {
                                                disableUnderline: true,
                                                sx: {
                                                    px: 3, py: 1.5,
                                                    bgcolor: 'rgba(0,0,0,0.03)',
                                                    '.dark &': { bgcolor: 'rgba(255,255,255,0.03)', color: 'white' },
                                                    borderRadius: '1rem',
                                                    fontWeight: 700
                                                }
                                            }
                                        }
                                    }
                                }}
                            />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', ml: 1, mb: 0.5, display: 'block', fontSize: '10px' }}>
                                Trip Status
                            </Typography>
                            <Select
                                fullWidth
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                variant="standard"
                                disableUnderline
                                sx={{
                                    px: 3, py: 0.5,
                                    bgcolor: 'rgba(0,0,0,0.03)',
                                    '.dark &': { bgcolor: 'rgba(255,255,255,0.03)', color: 'white' },
                                    borderRadius: '1rem',
                                    fontWeight: 700,
                                    '& .MuiSelect-select': { py: 1.5 }
                                }}
                            >
                                <MenuItem value="upcoming">Upcoming</MenuItem>
                                <MenuItem value="ongoing">In Progress</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                                <MenuItem value="cancelled">Cancelled</MenuItem>
                            </Select>
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', ml: 1, mb: 0.5, display: 'block', fontSize: '10px' }}>
                            Update Description
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            variant="standard"
                            placeholder="Tell potential companions something about your trip..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            slotProps={{
                                input: {
                                    disableUnderline: true,
                                    sx: {
                                        px: 3, py: 2,
                                        bgcolor: 'rgba(0,0,0,0.03)',
                                        '.dark &': { bgcolor: 'rgba(255,255,255,0.03)', color: 'white' },
                                        borderRadius: '1.25rem',
                                        fontWeight: 600,
                                        lineHeight: 1.6
                                    }
                                }
                            }}
                        />
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button
                    onClick={onClose}
                    sx={{ borderRadius: '1rem', px: 4, py: 1.5, fontWeight: 900, textTransform: 'none', color: 'text.secondary' }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    variant="contained"
                    sx={{
                        borderRadius: '1rem',
                        px: 6,
                        py: 1.5,
                        fontWeight: 900,
                        textTransform: 'none',
                        bgcolor: '#0f172a',
                        '.dark &': { bgcolor: '#f1f5f9', color: '#0f172a' },
                        '&:hover': { bgcolor: '#334155' }
                    }}
                >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
