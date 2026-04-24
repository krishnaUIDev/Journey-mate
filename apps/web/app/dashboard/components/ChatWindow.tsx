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
    Tooltip,
    Popover
} from "@mui/material";
import {
    Send as SendIcon,
    Close as CloseIcon,
    ChatBubbleOutlined as ChatIcon,
    SentimentSatisfiedAltOutlined as EmojiIcon,
    EditOutlined as EditIcon,
    Check as SaveIcon,
    Clear as CancelIcon,
    DeleteOutlined as DeleteIcon,
    ReplyOutlined as ReplyIcon
} from "@mui/icons-material";
import { useMessages, Message } from "../../../context/MessagesContext";
import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react";

dayjs.extend(relativeTime);

interface ChatWindowProps {
    journeyId: string;
    onClose?: () => void;
}

export function ChatWindow({ journeyId, onClose }: ChatWindowProps) {
    const { messages, loading, sendMessage, subscribeToJourney, editMessage, deleteMessage } = useMessages();
    const { user } = useUser();
    const [input, setInput] = useState("");
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [emojiAnchorEl, setEmojiAnchorEl] = useState<HTMLButtonElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = subscribeToJourney(journeyId);
        return () => unsubscribe();
    }, [journeyId, subscribeToJourney]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleEmojiClick = (emojiData: any) => {
        setInput(prev => prev + emojiData.emoji);
        setEmojiAnchorEl(null);
    };

    const handleEditSave = async (msgId: string) => {
        if (!editContent.trim()) return;
        try {
            await editMessage(msgId, editContent);
            setEditingMessageId(null);
            setEditContent("");
        } catch (error) {
            // Error handled by context
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const currentInput = input;
        const currentReplyToId = replyingTo?.id || null;

        setInput("");
        setReplyingTo(null);

        try {
            await sendMessage(journeyId, currentInput, currentReplyToId);
        } catch (error) {
            setInput(currentInput);
            setReplyingTo(replyingTo);
        }
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
                overflow: 'hidden',
                position: 'relative'
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
                        const parentMsg = msg.reply_to_id ? messages.find(m => m.id === msg.reply_to_id) : null;

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
                                    <Avatar
                                        src={msg.sender_avatar}
                                        sx={{ width: 28, height: 28, border: '1px solid rgba(0,0,0,0.1)' }}
                                    />
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0.5,
                                        alignItems: isMe ? 'flex-end' : 'flex-start'
                                    }}>
                                        {parentMsg && (
                                            <Box sx={{
                                                p: 1.5,
                                                mb: -1.5,
                                                pb: 2.5,
                                                borderRadius: '1rem 1rem 0 0',
                                                bgcolor: 'rgba(0,0,0,0.03)',
                                                '.dark &': { bgcolor: 'rgba(255,255,255,0.03)' },
                                                border: '1px solid rgba(0,0,0,0.05)',
                                                maxWidth: '90%',
                                                opacity: 0.6
                                            }}>
                                                <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', mb: 0.2 }}>
                                                    {parentMsg.sender_name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontSize: '0.7rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {parentMsg.content}
                                                </Typography>
                                            </Box>
                                        )}
                                        <Box sx={{
                                            p: 2,
                                            borderRadius: isMe ? '1.25rem 1.25rem 0 1.25rem' : '1.25rem 1.25rem 1.25rem 0',
                                            bgcolor: isMe ? 'navy' : 'rgba(0,0,0,0.04)',
                                            color: isMe ? 'white' : 'inherit',
                                            '.dark &': {
                                                bgcolor: isMe ? 'sand' : 'rgba(255,255,255,0.05)',
                                                color: isMe ? 'navy' : 'white'
                                            },
                                            position: 'relative',
                                            zIndex: 1,
                                            '&:hover .action-btns': { opacity: 0.8 }
                                        }}>
                                            {editingMessageId === msg.id ? (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 200 }}>
                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        variant="standard"
                                                        autoFocus
                                                        multiline
                                                        slotProps={{
                                                            input: {
                                                                sx: { color: 'inherit', fontSize: '0.875rem' },
                                                                disableUnderline: false
                                                            }
                                                        }}
                                                    />
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                        <IconButton size="small" onClick={() => handleEditSave(msg.id)} sx={{ color: 'inherit' }}>
                                                            <SaveIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => setEditingMessageId(null)} sx={{ color: 'inherit' }}>
                                                            <CancelIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <>
                                                    <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.5 }}>
                                                        {msg.content}
                                                    </Typography>

                                                    {/* Action Buttons (Reply, Edit, Delete) */}
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        [isMe ? 'right' : 'left']: '100%',
                                                        transform: 'translateY(-50%)',
                                                        mx: 1,
                                                        display: 'flex',
                                                        gap: 0.5,
                                                        opacity: 0,
                                                        transition: 'opacity 0.2s',
                                                        zIndex: 10,
                                                        pointerEvents: 'auto'
                                                    }} className="action-btns">
                                                        <IconButton size="small" onClick={() => setReplyingTo(msg)} sx={{ color: 'text.secondary' }}>
                                                            <ReplyIcon sx={{ fontSize: '0.9rem' }} />
                                                        </IconButton>
                                                        {isMe && (
                                                            <>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => {
                                                                        setEditingMessageId(msg.id);
                                                                        setEditContent(msg.content);
                                                                    }}
                                                                    sx={{ color: 'text.secondary' }}
                                                                >
                                                                    <EditIcon sx={{ fontSize: '0.9rem' }} />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteMessage(msg.id);
                                                                    }}
                                                                    sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'rgba(211, 47, 47, 0.04)' } }}
                                                                >
                                                                    <DeleteIcon sx={{ fontSize: '0.9rem' }} />
                                                                </IconButton>
                                                            </>
                                                        )}
                                                    </Box>
                                                </>
                                            )}
                                        </Box>
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

            {/* Reply Preview Area */}
            {replyingTo && (
                <Box sx={{
                    p: 2,
                    bgcolor: 'rgba(0,0,0,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                    '.dark &': {
                        bgcolor: 'rgba(255,255,255,0.02)',
                        borderTop: '1px solid rgba(255,255,255,0.05)'
                    }
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2, overflow: 'hidden' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800 }}>
                            Replying to {replyingTo.sender_name}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {replyingTo.content}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setReplyingTo(null)}>
                        <CancelIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                </Box>
            )}

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
                    pl: 2,
                    position: 'relative'
                }}>
                    <IconButton
                        size="small"
                        onClick={(e) => setEmojiAnchorEl(e.currentTarget)}
                        sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                    >
                        <EmojiIcon fontSize="small" />
                    </IconButton>

                    <Popover
                        open={Boolean(emojiAnchorEl)}
                        anchorEl={emojiAnchorEl}
                        onClose={() => setEmojiAnchorEl(null)}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        slotProps={{
                            paper: {
                                sx: {
                                    borderRadius: '1.25rem',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                    overflow: 'hidden',
                                    border: 'none',
                                    mt: -1
                                }
                            }
                        }}
                    >
                        <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            autoFocusSearch={false}
                            theme={EmojiTheme.AUTO}
                            width={320}
                            height={400}
                            previewConfig={{ showPreview: false }}
                            skinTonesDisabled
                            searchPlaceHolder="Search emojis..."
                        />
                    </Popover>

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
                                bgcolor: input.trim() ? '#22c55e' : 'transparent',
                                color: input.trim() ? 'white' : 'text.disabled',
                                '&:hover': { bgcolor: '#16a34a' },
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
