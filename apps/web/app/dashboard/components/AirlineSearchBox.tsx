"use client";

import React, { useState, useEffect } from "react";
import {
    Autocomplete,
    TextField,
    CircularProgress,
    Box,
    Typography
} from "@mui/material";

interface Airline {
    name: string;
    iata: string;
    logo?: string;
}

interface AirlineSearchBoxProps {
    value: string;
    onChange: (value: string, iata?: string) => void;
    label?: string;
    placeholder?: string;
}

export function AirlineSearchBox({ value, onChange, label, placeholder }: AirlineSearchBoxProps) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<Airline[]>([]);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!open) return;

        const fetchAirlines = async () => {
            setLoading(true);
            try {
                const response = await fetch("https://api.travelpayouts.com/data/en/airlines.json");
                const data = await response.json();

                const validAirlines = data
                    .filter((a: any) => a.name && a.code && a.code.length === 2)
                    .map((a: any) => ({
                        name: a.name,
                        iata: a.code,
                        logo: `https://www.gstatic.com/flights/airline_logos/70px/${a.code}.png`
                    }))
                    .sort((a: any, b: any) => a.name.localeCompare(b.name));

                setOptions(validAirlines);
            } catch (error) {
                console.error("Error fetching airlines:", error);
                setOptions([
                    { name: "Emirates", iata: "EK" },
                    { name: "Qatar Airways", iata: "QR" },
                    { name: "Singapore Airlines", iata: "SQ" },
                    { name: "Air India", iata: "AI" },
                    { name: "IndiGo", iata: "6E" }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchAirlines();
    }, [open]);

    return (
        <Box sx={{ width: '100%' }}>
            {label && (
                <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 900, color: 'text.secondary', ml: 1, fontSize: '10px', mb: 0.5, display: 'block', '.dark &': { color: 'rgba(255,255,255,0.5)' } }}>
                    {label}
                </Typography>
            )}
            <Autocomplete
                freeSolo
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                options={options}
                loading={loading}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                value={value}
                onChange={(_, newValue) => {
                    if (typeof newValue === 'string') {
                        onChange(newValue);
                    } else if (newValue) {
                        onChange(newValue.name, newValue.iata);
                    } else {
                        onChange("");
                    }
                }}
                onInputChange={(_, newStr) => {
                    if (!options.some(o => o.name === newStr)) {
                        onChange(newStr);
                    }
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={placeholder}
                        variant="standard"
                        slotProps={{
                            ...params.slotProps,
                            input: {
                                ...params.slotProps?.input,
                                disableUnderline: true,
                                sx: {
                                    px: 3, py: 1.5, bgcolor: 'rgba(0,0,0,0.03)',
                                    borderRadius: '1.25rem', fontSize: '0.875rem', fontWeight: 700,
                                    '.dark &': { color: 'white', bgcolor: 'rgba(255,255,255,0.03)' }
                                },
                                endAdornment: (
                                    <React.Fragment>
                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.slotProps?.input?.endAdornment}
                                    </React.Fragment>
                                )
                            }
                        }}
                    />
                )}
                renderOption={(props, option) => {
                    const { key, ...rest } = props as any;
                    return (
                        <li key={option.iata} {...rest}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                                <img
                                    src={option.logo}
                                    alt={option.iata}
                                    style={{ width: 24, height: 24, objectFit: 'contain' }}
                                    onError={(e) => { (e.target as any).src = "https://api.dicebear.com/7.x/initials/svg?seed=" + option.iata }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{option.name}</Typography>
                            </Box>
                        </li>
                    );
                }}
            />
        </Box>
    );
}
