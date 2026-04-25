"use client";

import React, { useState, useEffect } from "react";
import { TextField, Autocomplete, Box, Typography, CircularProgress } from "@mui/material";
import Image from "next/image";

interface Airline {
    name: string;
    iata: string;
    logo?: string;
}

interface AirlineAutocompleteProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
}

export function AirlineAutocomplete({ label, placeholder, value, onChange }: AirlineAutocompleteProps) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<Airline[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;

        const fetchAirlines = async () => {
            setLoading(true);
            try {
                // Fetch curated airline data from Travelpayouts
                const response = await fetch("https://api.travelpayouts.com/data/en/airlines.json");
                const data = await response.json();

                // Filter out entries without names or valid IATA codes
                const validAirlines = data
                    .filter((a: any) => a.name && a.code && a.code.length === 2 && a.is_lowcost !== undefined)
                    .map((a: any) => ({
                        name: a.name,
                        iata: a.code,
                        logo: `https://www.gstatic.com/flights/airline_logos/70px/${a.code}.png`
                    }))
                    .sort((a: any, b: any) => a.name.localeCompare(b.name));

                setOptions(validAirlines);
            } catch (error) {
                console.error("Error fetching airlines:", error);
                // Fallback to a few major ones if API fails
                setOptions([
                    { name: "Emirates", iata: "EK" },
                    { name: "Qatar Airways", iata: "QR" },
                    { name: "Singapore Airlines", iata: "SQ" },
                    { name: "British Airways", iata: "BA" },
                    { name: "Air India", iata: "AI" },
                    { name: "IndiGo", iata: "6E" },
                    { name: "Lufthansa", iata: "LH" },
                    { name: "Delta Air Lines", iata: "DL" }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchAirlines();
    }, [open]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
            {label && (
                <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 900, color: 'text.secondary', ml: 1, fontSize: '10px', letterSpacing: '0.05em' }}>
                    {label}
                </Typography>
            )}
            <Autocomplete
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                isOptionEqualToValue={(option, val) => {
                    if (typeof val === 'string') return option.name === val;
                    return option.name === (val as Airline).name;
                }}
                getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return (option as Airline).name;
                }}
                options={options}
                loading={loading}
                value={(options.find(o => o.name === value) as Airline | undefined) || value}
                onChange={(_, newValue) => {
                    if (typeof newValue === 'string') {
                        onChange(newValue);
                    } else if (newValue && typeof newValue !== 'string') {
                        onChange((newValue as Airline).name);
                    } else {
                        onChange("");
                    }
                }}
                onInputChange={(_, newInputValue) => {
                    if (!options.some(o => o.name === newInputValue)) {
                        onChange(newInputValue);
                    }
                }}
                freeSolo
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={placeholder}
                        variant="outlined"
                        fullWidth
                    />
                )}
                renderOption={(props, option) => {
                    const { key, ...rest } = props as any;
                    return (
                        <li key={option.iata} {...rest}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                                <Box sx={{ width: 32, h: 32, bgcolor: 'white', borderRadius: 1.5, p: 0.5, border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    <img
                                        src={`https://www.gstatic.com/flights/airline_logos/70px/${option.iata}.png`}
                                        alt={option.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/initials/svg?seed=' + option.iata;
                                        }}
                                    />
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                        {option.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                        {option.iata}
                                    </Typography>
                                </Box>
                            </Box>
                        </li>
                    );
                }}
            />
        </Box>
    );
}
