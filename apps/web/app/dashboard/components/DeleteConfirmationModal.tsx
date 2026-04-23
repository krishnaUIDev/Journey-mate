"use client";

import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton
} from "@mui/material";
import {
    DeleteOutlined as DeleteIcon,
    Close as CloseIcon,
    WarningAmberRounded as WarningIcon
} from "@mui/icons-material";

interface DeleteConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    submitting?: boolean;
}

export function DeleteConfirmationModal({ open, onClose, onConfirm, title, submitting }: DeleteConfirmationModalProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '2rem',
                        p: 1,
                        bgcolor: 'background.paper',
                        backgroundImage: 'none',
                        '.dark &': { bgcolor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }
                    }
                }
            }}
        >
            <DialogTitle component="div" sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ px: 4, pb: 2, textAlign: 'center' }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 3,
                    color: 'error.main',
                    bgcolor: 'error.lighter',
                    width: 80,
                    height: 80,
                    borderRadius: '2rem',
                    alignItems: 'center',
                    mx: 'auto',
                    '.dark &': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
                }}>
                    <WarningIcon sx={{ fontSize: 40 }} />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em' }}>
                    Delete Trip?
                </Typography>

                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, px: 2 }}>
                    Are you sure you want to delete your trip to <strong>{title}</strong>? This action cannot be undone.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 4, gap: 2, flexDirection: 'column' }}>
                <Button
                    fullWidth
                    onClick={onConfirm}
                    disabled={submitting}
                    variant="contained"
                    color="error"
                    sx={{
                        borderRadius: '1.25rem',
                        py: 2,
                        fontWeight: 900,
                        textTransform: 'none',
                        fontSize: '1rem',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: 'error.dark', boxShadow: 'none' }
                    }}
                >
                    {submitting ? "Deleting..." : "Yes, Delete Trip"}
                </Button>
                <Button
                    fullWidth
                    onClick={onClose}
                    sx={{
                        borderRadius: '1.25rem',
                        py: 1.5,
                        fontWeight: 700,
                        textTransform: 'none',
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.03)', '.dark &': { bgcolor: 'rgba(255,255,255,0.03)' } }
                    }}
                >
                    Keep Trip
                </Button>
            </DialogActions>
        </Dialog>
    );
}
