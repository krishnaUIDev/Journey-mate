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
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon, Verified as VerifiedIcon } from "@mui/icons-material";
import { scanBoardingPass } from "../../actions/aiScanner";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { AirportAutocomplete } from "./AirportAutocomplete";
import { JourneyPost, useJourneys } from "../../../context/JourneysContext";
import { supabase } from "../../../lib/supabase";
import Image from "next/image";
import dynamic from "next/dynamic";

const AirlineSearchBox = dynamic(() => import("./AirlineSearchBox").then(mod => mod.AirlineSearchBox), { ssr: false });

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
    const [airlineName, setAirlineName] = useState(journey.airlineName || "");
    const [airlineIata, setAirlineIata] = useState(journey.airlineIata || "");
    const [layovers, setLayovers] = useState<string[]>(journey.layovers || []);
    const [description, setDescription] = useState(journey.description);
    const [contactInfo, setContactInfo] = useState(journey.contactInfo || "");
    const [status, setStatus] = useState<'upcoming' | 'ongoing' | 'completed' | 'cancelled'>(journey.status);
    const [boardingPassUrl, setBoardingPassUrl] = useState(journey.boardingPassUrl || "");
    const [uploadingPass, setUploadingPass] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [routeCoords, setRouteCoords] = useState<Record<string, [number, number]>>(journey.routeData || {});

    useEffect(() => {
        if (open) {
            setFrom(journey.from);
            setTo(journey.to);
            setDate(dayjs(journey.date));
            setFlightNumber(journey.flightNumber || "");
            setAirlineName(journey.airlineName || "");
            setAirlineIata(journey.airlineIata || "");
            setLayovers(journey.layovers || []);
            setDescription(journey.description);
            setContactInfo(journey.contactInfo || "");
            setStatus(journey.status);
            setBoardingPassUrl(journey.boardingPassUrl || "");
            setRouteCoords(journey.routeData || {});
        }
    }, [open, journey]);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleBoardingPassUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert("Please upload an image file.");
            return;
        }

        setUploadingPass(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `passes/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('boarding_passes')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('boarding_passes')
                .getPublicUrl(filePath);

            setBoardingPassUrl(publicUrl);

            /* AI SCANNER DISABLED FOR NOW
            setIsScanning(true);
            try {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = async () => {
                    const base64 = reader.result as string;
                    const result = await scanBoardingPass(base64, file.type);

                    if (result) {
                        if (result.origin) setFrom(result.origin);
                        if (result.destination) setTo(result.destination);
                        if (result.flight_number) setFlightNumber(result.flight_number);
                        if (result.airline) setAirlineName(result.airline);
                        if (result.date) setDate(dayjs(result.date));
                    }
                    setIsScanning(false);
                };
            } catch (scanErr) {
                console.error("Scanning failed:", scanErr);
                setIsScanning(false);
            }
            */
        } catch (err: any) {
            console.error("Error uploading boarding pass:", err);
            alert("Error uploading boarding pass: " + err.message);
        } finally {
            setUploadingPass(false);
        }
    };

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
                airlineName,
                airlineIata,
                layovers: layovers.map(l => l.split(' (')[1]?.replace(')', '') || l),
                description,
                contactInfo,
                status,
                routeData: routeCoords,
                boardingPassUrl,
                user: {
                    ...journey.user,
                    verificationTier: journey.user.verificationTier
                }
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
                <Typography variant="h5" component="span" sx={{ fontWeight: 900, letterSpacing: '-0.02em', '.dark &': { color: 'white' } }}>
                    Edit Trip Details
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ '.dark &': { color: 'rgba(255,255,255,0.6)' } }}>
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
                            onChange={(val, coords) => {
                                setFrom(val);
                                if (coords) {
                                    const code = val.split(' (')[1]?.replace(')', '') || val;
                                    setRouteCoords(prev => ({ ...prev, [code]: coords }));
                                }
                            }}
                        />
                        <AirportAutocomplete
                            label="To"
                            placeholder="Destination"
                            value={to}
                            onChange={(val, coords) => {
                                setTo(val);
                                if (coords) {
                                    const code = val.split(' (')[1]?.replace(')', '') || val;
                                    setRouteCoords(prev => ({ ...prev, [code]: coords }));
                                }
                            }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', ml: 1, mb: 0.5, display: 'block', fontSize: '10px', '.dark &': { color: 'rgba(255,255,255,0.5)' } }}>
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
                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', ml: 1, mb: 0.5, display: 'block', fontSize: '10px', '.dark &': { color: 'rgba(255,255,255,0.5)' } }}>
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

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] flex items-center gap-2 mb-2">
                                <span className="w-1 h-1 bg-forest/40 rounded-full" /> Airline Name (Optional)
                            </label>
                            <AirlineSearchBox
                                label="Airline Name"
                                placeholder="e.g. Emirates"
                                value={airlineName}
                                onChange={(name, iata) => {
                                    setAirlineName(name);
                                    if (iata) setAirlineIata(iata);
                                }}
                            />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', ml: 1, mb: 0.5, display: 'block', fontSize: '10px', '.dark &': { color: 'rgba(255,255,255,0.5)' } }}>
                                Flight Number
                            </Typography>
                            <TextField
                                fullWidth
                                variant="standard"
                                placeholder="e.g. EK501"
                                value={flightNumber}
                                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                                slotProps={{
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
                                }}
                            />
                        </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', fontSize: '10px', color: 'text.secondary', '.dark &': { color: 'rgba(255,255,255,0.4)' } }}>
                            Boarding Pass Verification (Optional)
                        </Typography>
                        <Box sx={{
                            p: 2,
                            border: '1px dashed',
                            borderColor: 'divider',
                            borderRadius: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            bgcolor: 'rgba(0,0,0,0.01)',
                            '.dark &': { bgcolor: 'rgba(255,255,255,0.01)' }
                        }}>
                            {boardingPassUrl ? (
                                <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '0.75rem', overflow: 'hidden' }}>
                                    <Image
                                        src={boardingPassUrl}
                                        alt="Boarding Pass"
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <Box sx={{
                                        position: 'absolute', inset: 0, bgcolor: 'black/40',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        opacity: 0, '&:hover': { opacity: 1 }, transition: '0.2s'
                                    }}>
                                        <Button variant="contained" color="error" size="small" onClick={() => setBoardingPassUrl("")} sx={{ borderRadius: '1rem', fontWeight: 900 }}>
                                            Remove
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Button
                                    fullWidth
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingPass || isScanning}
                                    sx={{
                                        py: 3,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: '0.75rem',
                                        textTransform: 'none',
                                        fontWeight: 800,
                                        color: 'text.secondary',
                                        '.dark &': { color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' },
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' }
                                    }}
                                >
                                    {uploadingPass ? <CircularProgress size={20} /> : isScanning ? "Scanning..." : "Upload Boarding Pass"}
                                </Button>
                            )}
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleBoardingPassUpload} />
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', ml: 1, mb: 0.5, display: 'block', fontSize: '10px', '.dark &': { color: 'rgba(255,255,255,0.5)' } }}>
                            Layovers (Optional)
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {layovers.map((l, idx) => (
                                <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Box sx={{ flex: 1 }}>
                                        <AirportAutocomplete
                                            label=""
                                            placeholder={`Layover ${idx + 1}`}
                                            value={l}
                                            onChange={(val, coords) => {
                                                const newL = [...layovers];
                                                newL[idx] = val;
                                                setLayovers(newL);
                                                if (coords) {
                                                    const code = val.split(' (')[1]?.replace(')', '') || val;
                                                    setRouteCoords(prev => ({ ...prev, [code]: coords }));
                                                }
                                            }}
                                        />
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={() => setLayovers(layovers.filter((_, i) => i !== idx))}
                                        sx={{ mt: 2, color: 'error.main' }}
                                    >
                                        <DeleteIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                startIcon={<AddIcon />}
                                disabled={layovers.length > 0 && !layovers[layovers.length - 1]}
                                onClick={() => setLayovers([...layovers, ""])}
                                size="small"
                                sx={{
                                    alignSelf: 'flex-start',
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    fontSize: '11px',
                                    color: 'forest.main',
                                    bgcolor: 'rgba(34, 197, 94, 0.05)',
                                    borderRadius: '1rem',
                                    px: 2,
                                    '&:hover': { bgcolor: 'rgba(34, 197, 94, 0.1)' },
                                    '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.03)', color: 'text.disabled' }
                                }}
                            >
                                Add Layover
                            </Button>
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', ml: 1, mb: 0.5, display: 'block', fontSize: '10px', '.dark &': { color: 'rgba(255,255,255,0.5)' } }}>
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
                    sx={{ borderRadius: '1rem', px: 4, py: 1.5, fontWeight: 900, textTransform: 'none', color: 'text.secondary', '.dark &': { color: 'rgba(255,255,255,0.5)' } }}
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
