"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Autocomplete,
    TextField,
    CircularProgress,
    Box,
    Typography,
    Paper,
    styled
} from "@mui/material";
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import LocationCityIcon from '@mui/icons-material/LocationCity';

interface AirportApiResponse {
    code: string;
    name: string;
    city_name: string;
    country_name: string;
    type: string;
}

interface AirportAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
    className?: string;
}

// Custom Paper component for glassmorphic effect
const CustomPaper = styled(Paper)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1.5rem',
    marginTop: '0.5rem',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    border: '1px solid rgba(0,0,0,0.05)',
    '&.dark': {
        background: 'rgba(5, 8, 16, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
    }
}));

export function AirportAutocomplete({ value, onChange, placeholder, label, className = "" }: AirportAutocompleteProps) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<AirportApiResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [selectedOption, setSelectedOption] = useState<AirportApiResponse | null>(null);

    // Sync internal object state if string value is cleared
    useEffect(() => {
        if (!value) setSelectedOption(null);
    }, [value]);

    const fetchAirports = async (term: string) => {
        if (term.length < 2) {
            setOptions([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `https://autocomplete.travelpayouts.com/places2?locale=en&types[]=airport&types[]=city&term=${encodeURIComponent(term)}`
            );
            const data = await response.json();
            setOptions(data as AirportApiResponse[]);
        } catch (error) {
            console.error("Error fetching airports:", error);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    // Simple debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (inputValue) fetchAirports(inputValue);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [inputValue]);

    // Ensure currently selected option is always in the list to prevent clearing
    const displayOptions = [...options];
    if (selectedOption && !displayOptions.find(opt => opt.code === selectedOption.code)) {
        displayOptions.unshift(selectedOption);
    }

    return (
        <Box className={`flex-1 ${className}`}>
            <Typography variant="caption" sx={{
                display: 'block',
                textTransform: 'uppercase',
                fontWeight: 900,
                color: 'text.secondary',
                mb: 0.5,
                ml: 1,
                fontSize: '10px',
                letterSpacing: '0.05em'
            }}>
                {label}
            </Typography>
            <Autocomplete
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                isOptionEqualToValue={(option, val) => option?.code === val?.code}
                getOptionLabel={(option) =>
                    typeof option === 'string' ? option : `${option.city_name || option.name} (${option.code})`
                }
                options={displayOptions}
                loading={loading}
                value={selectedOption && `${selectedOption.city_name || selectedOption.name} (${selectedOption.code})` === value ? selectedOption : null}
                onChange={(_, newValue) => {
                    if (newValue && typeof newValue !== 'string') {
                        setSelectedOption(newValue);
                        onChange(`${newValue.city_name || newValue.name} (${newValue.code})`);
                    } else if (!newValue) {
                        setSelectedOption(null);
                        onChange("");
                    }
                }}
                onInputChange={(_, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                filterOptions={(x) => x} // Disable built-in filtering, using API
                slots={{
                    paper: (props) => (
                        <CustomPaper
                            {...props}
                            className={typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : ''}
                        />
                    )
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={placeholder}
                        variant="standard"
                        slotProps={{
                            ...params.slotProps,
                            input: {
                                ...(params.slotProps?.input || {}),
                                disableUnderline: true,
                                endAdornment: (
                                    <React.Fragment>
                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.slotProps?.input?.endAdornment}
                                    </React.Fragment>
                                ),
                                sx: {
                                    px: 3,
                                    py: 1.2,
                                    bgcolor: 'rgba(0,0,0,0.03)',
                                    '.dark &': { color: 'white', bgcolor: 'rgba(255,255,255,0.03)' },
                                    borderRadius: '1rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 700,
                                    border: '1px solid transparent',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        bgcolor: 'rgba(0,0,0,0.05)',
                                        '.dark &': { bgcolor: 'rgba(255,255,255,0.05)' },
                                    },
                                    '&.Mui-focused': {
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.1)',
                                    }
                                }
                            }
                        }}
                    />
                )}
                renderOption={(props, option) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { key, ...optionProps } = props;
                    return (
                        <Box component="li" key={option.code} {...optionProps} sx={{
                            px: 3,
                            py: 1.5,
                            borderBottom: '1px solid rgba(0,0,0,0.05)',
                            '.dark &': { borderColor: 'rgba(255,255,255,0.05)' },
                            '&:last-child': { borderBottom: 'none' }
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                <Box sx={{
                                    p: 1,
                                    borderRadius: '0.75rem',
                                    bgcolor: option.type === 'city' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                    color: option.type === 'city' ? '#3B82F6' : '#10B981'
                                }}>
                                    {option.type === 'city' ? <LocationCityIcon sx={{ fontSize: 18 }} /> : <FlightTakeoffIcon sx={{ fontSize: 18 }} />}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle2" sx={{
                                        fontWeight: 800,
                                        color: 'text.primary',
                                        '.dark &': { color: 'white' }
                                    }}>
                                        {option.city_name || option.name} <Box component="span" sx={{ color: '#10B981' }}>({option.code})</Box>
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: -0.2 }}>
                                        {option.name}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', letterSpacing: '0.05em' }}>
                                    {option.country_name}
                                </Typography>
                            </Box>
                        </Box>
                    );
                }}
            />
        </Box>
    );
}
