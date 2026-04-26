"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@mui/material';

const JourneyMap = dynamic(() => import("../dashboard/components/JourneyMap"), {
    ssr: false,
    loading: () => <Box sx={{ width: '100%', height: '100%', bgcolor: 'rgba(0,0,0,0.05)' }} className="animate-pulse" />
});

interface BlogMapSectionProps {
    center: [number, number];
    label: string;
}

export function BlogMapSection({ center, label }: BlogMapSectionProps) {
    return (
        <Box sx={{ height: 400, width: '100%', position: 'relative', overflow: 'hidden' }}>
            <JourneyMap
                center={center}
                zoom={6}
                markers={[{
                    position: center,
                    label: label,
                    type: 'destination'
                }]}
                isAnimated={false}
            />
            <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 100,
                background: 'linear-gradient(to top, white, transparent)',
                '.dark &': { background: 'linear-gradient(to top, #020617, transparent)' },
                zIndex: 1000,
                pointerEvents: 'none'
            }} />
        </Box>
    );
}
