"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Typography,
    Avatar,
    Divider,
    CircularProgress,
    Tooltip
} from "@mui/material";
import {
    Send as SendIcon,
    Close as CloseIcon,
    ChatBubbleOutlined as ChatIcon
} from "@mui/icons-material";
import { useMessages, Message } from "../../../context/MessagesContext";
import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface ChatWindowProps {
    journeyId: string;
    onClose?: () => void;
}

export function ChatWindow({ journeyId, onClose }: ChatWindowProps) {
    const { messages, loading, sendMessage, subscribeToJourney } = useMessages();
    const { user } = useUser();
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = subscribeToJourney(journeyId);
        return () => unsubscribe();
    }, [journeyId, subscribeToJourney]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const currentInput = input;
        setInput("");
        await sendMessage(journeyId, currentInput);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                border: "1px solid rgba(0,0,0,0.05)",
                '.dark &': { border: '1px solid rgba(255,255,255,0.05)', bgcolor: '#0f172a' },
                borderRadius: '1.5rem',
                overflow: 'hidden'
            }}
        >
            {/* Chat Header */}
            <Box sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'rgba(0,0,0,0.02)',
                '.dark &': { bgcolor: 'rgba(255,255,255,0.02)' }
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ChatIcon sx={{ color: 'forest' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                        Trip Discussion
                    </Typography>
                </Box>
                {onClose && (
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>

            <Divider sx={{ opacity: 0.5 }} />

            {/* Messages Area */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: '10px' }
            }}>
                {loading && messages.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={24} color="inherit" sx={{ opacity: 0.3 }} />
                    </Box>
                ) : messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10, opacity: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>No messages yet.</Typography>
                        <Typography variant="caption">Start the conversation!</Typography>
                    </Box>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === user?.id;
                        return (
                            <Box
                                key={msg.id}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMe ? 'flex-end' : 'flex-start',
                                    gap: 0.5
                                }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: isMe ? 'row-reverse' : 'row',
                                    alignItems: 'flex-end',
                                    gap: 1,
                                    maxWidth: '85%'
                                }}>
                                    {!isMe && (
                                        <Avatar
                                            src={msg.sender_avatar}
                                            sx={{ width: 28, height: 28, border: '1px solid rgba(0,0,0,0.1)' }}
                                        />
                                    )}
                                    <Box sx={{
                                        p: 2,
                                        borderRadius: isMe ? '1.25rem 1.25rem 0 1.25rem' : '1.25rem 1.25rem 1.25rem 0',
                                        bgcolor: isMe ? 'navy' : 'rgba(0,0,0,0.04)',
                                        color: isMe ? 'white' : 'inherit',
                                        '.dark &': {
                                            bgcolor: isMe ? 'sand' : 'rgba(255,255,255,0.05)',
                                            color: isMe ? 'navy' : 'white'
                                        }
                                    }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.5 }}>
                                            {msg.content}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="caption" sx={{ opacity: 0.4, fontSize: '0.65rem', px: 1 }}>
                                    {isMe ? 'You' : msg.sender_name} • {dayjs(msg.created_at).fromNow()}
                                </Typography>
                            </Box>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </Box>

            <Divider sx={{ opacity: 0.5 }} />

            {/* Input Area */}
            <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'rgba(0,0,0,0.03)',
                    '.dark &': { bgcolor: 'rgba(255,255,255,0.03)' },
                    borderRadius: '1.25rem',
                    p: 0.5,
                    pl: 2
                }}>
                    <TextField
                        fullWidth
                        placeholder="Type a message..."
                        variant="standard"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        slotProps={{
                            input: {
                                disableUnderline: true,
                                sx: { fontSize: '0.875rem', fontWeight: 600 }
                            }
                        }}
                    />
                    <Tooltip title="Send Message">
                        <IconButton
                            onClick={handleSend}
                            disabled={!input.trim()}
                            sx={{
                                bgcolor: input.trim() ? 'forest' : 'transparent',
                                color: input.trim() ? 'white' : 'text.disabled',
                                '&:hover': { bgcolor: 'navy' },
                                borderRadius: '1rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            <SendIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </Paper>
    );
}
