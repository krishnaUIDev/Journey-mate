"use client";

import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import {
    VerifiedUser as VerifiedIcon,
    WorkspacePremium as PremiumIcon,
    Shield as ShieldIcon
} from '@mui/icons-material';

export type VerificationTier = 'bronze' | 'silver' | 'gold';

interface ProfileBadgeProps {
    tier: VerificationTier;
    showLabel?: boolean;
}

export const ProfileBadge: React.FC<ProfileBadgeProps> = ({ tier, showLabel = false }) => {
    const config = {
        bronze: {
            color: '#cd7f32',
            icon: <ShieldIcon sx={{ fontSize: 14 }} />,
            label: 'Bronze Verified',
            desc: 'Email identity confirmed.'
        },
        silver: {
            color: '#94a3b8',
            icon: <VerifiedIcon sx={{ fontSize: 14 }} />,
            label: 'Silver Status',
            desc: 'Boarding pass verified for this trip.'
        },
        gold: {
            color: '#fbbf24',
            icon: <PremiumIcon sx={{ fontSize: 14 }} />,
            label: 'Gold Elite',
            desc: 'Passport and trip fully verified.'
        }
    };

    const active = config[tier];

    return (
        <Tooltip title={active.desc} arrow>
            <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                bgcolor: `${active.color}15`,
                color: active.color,
                px: 1,
                py: 0.25,
                borderRadius: '100px',
                border: `1px solid ${active.color}30`,
                cursor: 'help'
            }}>
                {active.icon}
                {showLabel && (
                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: '9px',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}
                    >
                        {active.label}
                    </Typography>
                )}
            </Box>
        </Tooltip>
    );
};
