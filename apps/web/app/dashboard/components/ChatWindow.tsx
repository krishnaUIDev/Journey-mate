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
    Popover,
    Badge,
    AvatarGroup,
    Button,
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
    ReplyOutlined as ReplyIcon,
    AttachFile as AttachIcon,
    Image as ImageIcon,
    Mic as MicIcon,
    Stop as StopIcon,
    Phone as PhoneIcon,
    VideoCall as VideoCallIcon,
    PhoneMissed as MissedIcon,
    PhoneCallback as AcceptedIcon,
    CallMade as OutgoingIcon,
    CallReceived as IncomingIcon,
    Settings as SettingsIcon,
    CameraAlt as CameraIcon,
    Group as PeopleIcon,
} from "@mui/icons-material";
import { useMessages, Message } from "../../../context/MessagesContext";
import { useCalling } from "../../../context/CallingContext";
import { useJourneys } from "../../../context/JourneysContext";
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
    const { startCall } = useCalling();
    const { journeys, updateJourney } = useJourneys();
    const {
        messages,
        loading,
        sendMessage,
        uploadChatImage,
        uploadChatAudio,
        subscribeToJourney,
        editMessage,
        deleteMessage,
        typingUsers,
        setTypingStatus,
        getRequests
    } = useMessages();
    const { supabase } = useMessages() as any;
    const { user } = useUser();
    const [input, setInput] = useState("");
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [emojiAnchorEl, setEmojiAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [isTyping, setIsTyping] = useState(false);

    const [newGroupName, setNewGroupName] = useState("");
    const [stagedGroupAvatar, setStagedGroupAvatar] = useState<string | null>(null);
    const [updatingGroup, setUpdatingGroup] = useState(false);

    // File state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [participants, setParticipants] = useState<any[]>([]);
    const currentTypingUsers = typingUsers[journeyId] || [];
    const journey = journeys.find(j => j.id === journeyId);
    const isOwner = user?.id && journey?.userId && user.id.trim() === journey.userId.trim();

    useEffect(() => {
        if (journey) {
            console.log("[ChatWindow] Ownership Status:", {
                user: user?.id,
                journeyOwner: journey?.userId,
                isOwner,
                journeyId
            });
        }
    }, [user?.id, journey, isOwner, journeyId]);

    useEffect(() => {
        if (journey?.groupName) {
            setNewGroupName(journey.groupName);
        }
    }, [journey?.groupName]);

    useEffect(() => {
        const loadParticipants = async () => {
            const data = await getRequests(journeyId);
            setParticipants(data.filter((r: any) => r.status === 'accepted'));
        };
        loadParticipants();

        // Listen for status changes
        const channel = (supabase as any)
            ?.channel(`chat_participants_${journeyId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'journey_requests', filter: `journey_id=eq.${journeyId}` }, () => {
                loadParticipants();
            })
            .subscribe();

        return () => {
            if (channel) (supabase as any).removeChannel(channel);
        };
    }, [journeyId, getRequests, supabase]);

    useEffect(() => {
        const unsubscribe = subscribeToJourney(journeyId);
        return () => unsubscribe();
    }, [journeyId, subscribeToJourney]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, currentTypingUsers]);

    useEffect(() => {
        return () => {
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            if (recorderRef.current && recorderRef.current.state === "recording") {
                recorderRef.current.stop();
            }
        };
    }, []);

    // Typing indicator logic
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInput(e.target.value);

        if (!isTyping) {
            setIsTyping(true);
            setTypingStatus(journeyId, true);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setTypingStatus(journeyId, false);
        }, 3000);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert("Please select an image file.");
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorderRef.current = recorder;
            recorder.start();
            setIsRecording(true);
            setRecordingDuration(0);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone.");
        }
    };

    const handleStopRecording = () => {
        if (recorderRef.current && recorderRef.current.state === "recording") {
            recorderRef.current.stop();
        }
        setIsRecording(false);
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };

    const handleEmojiClick = (emojiData: any) => {
        setInput(prev => prev + emojiData.emoji);
        setEmojiAnchorEl(null);

        if (!isTyping) {
            setIsTyping(true);
            setTypingStatus(journeyId, true);
        }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setTypingStatus(journeyId, false);
        }, 3000);
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
        if (!input.trim() && !selectedFile && !audioBlob) return;

        const currentInput = input;
        const currentReplyToId = replyingTo?.id || null;
        const currentFile = selectedFile;
        const currentAudio = audioBlob;

        // Optimistic UI reset
        setInput("");
        setReplyingTo(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        setAudioBlob(null);
        setIsTyping(false);
        setTypingStatus(journeyId, false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        try {
            let imageUrl = null;
            let audioUrl = null;

            if (currentFile) {
                setUploading(true);
                imageUrl = await uploadChatImage(currentFile);
                setUploading(false);
            }

            if (currentAudio) {
                setUploading(true);
                audioUrl = await uploadChatAudio(currentAudio);
                setUploading(false);
            }

            await sendMessage(journeyId, currentInput, currentReplyToId, imageUrl, audioUrl);
        } catch (error) {
            // Restore if failed
            setInput(currentInput);
            setReplyingTo(replyingTo);
            setSelectedFile(currentFile);
            setAudioBlob(currentAudio);
            setUploading(false);
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
                bgcolor: 'white',
                '.dark &': {
                    border: '1px solid rgba(255,255,255,0.05)',
                    bgcolor: '#09090b', // Neutral dark
                    color: '#fafafa'
                },
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
                bgcolor: 'rgba(0,0,0,0.01)',
                '.dark &': { bgcolor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                        src={journey?.groupAvatar}
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'forest.main',
                            fontSize: '14px',
                            fontWeight: 900
                        }}
                    >
                        {journey?.groupName?.charAt(0) || <ChatIcon sx={{ color: 'white' }} />}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" sx={{
                            fontWeight: 900,
                            color: 'navy.main',
                            fontSize: '0.9rem',
                            letterSpacing: '-0.02em',
                            lineHeight: 1,
                            '.dark &': { color: 'white' }
                        }}>
                            {journey?.groupName || "Trip Discussion"}
                        </Typography>
                        <Typography variant="caption" sx={{
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontSize: '0.65rem',
                            mt: 0.5,
                            '.dark &': { color: 'slate.300 !important' }
                        }}>
                            <PeopleIcon sx={{ fontSize: 12, color: 'inherit' }} />
                            {participants.length + 1} {participants.length === 0 ? 'Member' : 'Members'} in Group
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {isOwner && (
                        <Tooltip title="Update Group Squad Identity">
                            <IconButton
                                onClick={(e) => setSettingsAnchorEl(e.currentTarget)}
                                size="small"
                                className="bg-green-500/10 text-green-600 dark:bg-white/10 dark:text-white"
                                sx={{ ml: 1 }}
                            >
                                <SettingsIcon sx={{ fontSize: 18 }} className="dark:text-white" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Audio Call">
                        <IconButton
                            onClick={() => startCall(journeyId, 'audio')}
                            size="small"
                            className="text-green-600 dark:text-white"
                        >
                            <PhoneIcon fontSize="small" className="dark:text-white" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Video Call">
                        <IconButton
                            onClick={() => startCall(journeyId, 'video')}
                            size="small"
                            className="text-green-600 dark:text-white"
                        >
                            <VideoCallIcon fontSize="small" className="dark:text-white" />
                        </IconButton>
                    </Tooltip>
                    {onClose && (
                        <IconButton
                            onClick={onClose}
                            size="small"
                            className="text-navy/60 dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
                        >
                            <CloseIcon fontSize="small" className="dark:text-white" />
                        </IconButton>
                    )}
                </Box>
            </Box>

            <Divider sx={{ opacity: 0.5 }} />

            {/* Messages Area */}
            <Box sx={{
                flex: 1,
                overflowY: "auto",
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                bgcolor: 'transparent',
                '.dark &': { bgcolor: '#09090b' },
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'rgba(0,0,0,0.1)',
                    borderRadius: '10px',
                    '.dark &': { bgcolor: 'rgba(255,255,255,0.1)' }
                }
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
                    <>
                        {messages.map((msg) => {
                            if (msg.call_metadata) {
                                return <CallLogMessage key={msg.id} msg={msg} />;
                            }
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
                                            {!isMe && (
                                                <Typography variant="caption" sx={{
                                                    ml: 1,
                                                    mb: 0.5,
                                                    display: 'block',
                                                    fontWeight: 800,
                                                    color: 'navy.main',
                                                    '.dark &': { color: 'white !important' }
                                                }}>
                                                    {msg.sender_name}
                                                </Typography>
                                            )}

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
                                                    opacity: 0.6,
                                                    borderLeft: `3px solid ${isMe ? 'navy' : 'gray'}`
                                                }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', mb: 0.2 }}>
                                                        {parentMsg.sender_name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontSize: '0.7rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {parentMsg.content}
                                                    </Typography>
                                                </Box>
                                            )}

                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    '&:hover .action-btns': { opacity: 1 }
                                                }}
                                            >
                                                <Tooltip title={dayjs(msg.created_at).format('LLL')} arrow placement={isMe ? 'left' : 'right'}>
                                                    <Box sx={{
                                                        p: 2,
                                                        borderRadius: isMe ? '1.25rem 1.25rem 0 1.25rem' : '1.25rem 1.25rem 1.25rem 0',
                                                        bgcolor: isMe ? 'navy' : 'rgba(0,0,0,0.04)',
                                                        color: isMe ? 'white' : 'inherit',
                                                        '.dark &': {
                                                            bgcolor: isMe ? '#10B981' : '#18181b', // Forest for me, Matte Slate for others
                                                            color: 'white'
                                                        },
                                                        position: 'relative',
                                                        zIndex: 1,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
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
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                {msg.image_url && (
                                                                    <Box
                                                                        component="img"
                                                                        src={msg.image_url}
                                                                        alt="Shared Item"
                                                                        sx={{
                                                                            width: '100%',
                                                                            maxWidth: 250,
                                                                            maxHeight: 300,
                                                                            objectFit: 'cover',
                                                                            borderRadius: '0.75rem',
                                                                            cursor: 'pointer',
                                                                            '&:hover': { opacity: 0.9 },
                                                                            mb: msg.content ? 0.5 : 0
                                                                        }}
                                                                        onClick={() => window.open(msg.image_url!, '_blank')}
                                                                    />
                                                                )}
                                                                {msg.audio_url && (
                                                                    <Box sx={{ minWidth: 200, mt: 0.5 }}>
                                                                        <audio
                                                                            controls
                                                                            src={msg.audio_url}
                                                                            style={{
                                                                                width: '100%',
                                                                                height: '32px',
                                                                                borderRadius: '16px',
                                                                                filter: isMe ? 'invert(1) grayscale(1) brightness(2)' : 'none'
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                )}
                                                                {msg.content && (
                                                                    <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                                                        {msg.content}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Tooltip>

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
                                                    pointerEvents: 'auto',
                                                    visibility: editingMessageId === msg.id ? 'hidden' : 'visible'
                                                }} className="action-btns">
                                                    <Tooltip title="Reply">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setReplyingTo(msg)}
                                                            className="text-slate-400 dark:text-slate-400 hover:text-navy dark:hover:text-white"
                                                        >
                                                            <ReplyIcon sx={{ fontSize: '0.9rem' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {isMe && (
                                                        <>
                                                            <Tooltip title="Edit">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => {
                                                                        setEditingMessageId(msg.id);
                                                                        setEditContent(msg.content);
                                                                    }}
                                                                    className="text-slate-400 dark:text-slate-400 hover:text-navy dark:hover:text-white"
                                                                >
                                                                    <EditIcon sx={{ fontSize: '0.9rem' }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteMessage(msg.id);
                                                                    }}
                                                                    className="text-slate-400 dark:text-slate-400 hover:text-red-500"
                                                                >
                                                                    <DeleteIcon sx={{ fontSize: '0.9rem' }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })}

                        {currentTypingUsers.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1, mt: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {currentTypingUsers.slice(0, 3).map((u) => (
                                        <Avatar key={u.id} src={u.avatar} sx={{ width: 16, height: 16 }} />
                                    ))}
                                </Box>
                                <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.7, fontWeight: 600 }}>
                                    {currentTypingUsers.length === 1
                                        ? `${currentTypingUsers[0]?.name} is typing...`
                                        : `${currentTypingUsers.length} people are typing...`}
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </Box>

            <Divider sx={{ opacity: 0.5 }} />

            {/* Preview Areas (Reply / Image / Audio) */}
            {
                (replyingTo || previewUrl || audioBlob) && (
                    <Box sx={{
                        p: 2,
                        bgcolor: 'rgba(0,0,0,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        borderTop: '1px solid rgba(0,0,0,0.05)',
                        '.dark &': { bgcolor: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden', flex: 1 }}>
                            {(previewUrl || audioBlob) && (
                                <Box sx={{ position: 'relative' }}>
                                    {previewUrl ? (
                                        <Box
                                            component="img"
                                            src={previewUrl}
                                            sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Box sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 1,
                                            bgcolor: 'navy',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}>
                                            <MicIcon fontSize="small" />
                                        </Box>
                                    )}
                                    {uploading && (
                                        <CircularProgress
                                            size={40}
                                            sx={{ position: 'absolute', top: 0, left: 0, color: 'forest' }}
                                        />
                                    )}
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2, overflow: 'hidden' }}>
                                {replyingTo ? (
                                    <>
                                        <Typography variant="caption" sx={{ fontWeight: 800 }}>
                                            Replying to {replyingTo.sender_name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {replyingTo.content}
                                        </Typography>
                                    </>
                                ) : (
                                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                                        {previewUrl ? 'Image ready to send' : 'Voice note ready to send'}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        <IconButton size="small" onClick={() => { setReplyingTo(null); setSelectedFile(null); setPreviewUrl(null); setAudioBlob(null); }}>
                            <CancelIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                    </Box>
                )
            }

            {/* Input Area */}
            <Box sx={{
                p: 2,
                bgcolor: '#ffffff',
                '.dark &': { bgcolor: '#09090b !important', borderTop: '1px solid rgba(255,255,255,0.05)' }
            }}>
                {isRecording ? (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        bgcolor: 'rgba(239, 68, 68, 0.05)',
                        borderRadius: '1.25rem',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, pl: 1 }}>
                            <Box sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: '#ef4444',
                                animation: 'pulse 1s infinite',
                                '@keyframes pulse': {
                                    '0%': { transform: 'scale(1)', opacity: 1 },
                                    '50%': { transform: 'scale(1.5)', opacity: 0.5 },
                                    '100%': { transform: 'scale(1)', opacity: 1 }
                                }
                            }} />
                            <Typography sx={{ color: '#ef4444', fontWeight: 800, fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                                RECORDING {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                            </Typography>
                        </Box>
                        <IconButton onClick={handleStopRecording} sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}>
                            <StopIcon />
                        </IconButton>
                    </Box>
                ) : (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: 'rgba(0,0,0,0.03)',
                        '.dark &': { bgcolor: '#18181b', border: '1px solid rgba(255,255,255,0.05)' },
                        borderRadius: '1.25rem',
                        p: 0.5,
                        pl: 1
                    }}>
                        <Tooltip title="Add emoji">
                            <IconButton
                                onClick={(e) => setEmojiAnchorEl(e.currentTarget)}
                                className="text-navy/60 dark:text-white/60 hover:text-navy dark:hover:text-white"
                            >
                                <EmojiIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Attach photo">
                            <IconButton
                                component="label"
                                className="text-navy/60 dark:text-white/60 hover:text-navy dark:hover:text-white"
                            >
                                <ImageIcon fontSize="small" />
                                <input type="file" hidden accept="image/*" onChange={handleFileSelect} />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Record voice message">
                            <IconButton
                                onClick={handleStartRecording}
                                disabled={uploading}
                                className="text-navy/60 dark:text-white/60 hover:text-navy dark:hover:text-white"
                            >
                                <MicIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Popover
                            open={Boolean(settingsAnchorEl)}
                            anchorEl={settingsAnchorEl}
                            onClose={() => setSettingsAnchorEl(null)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            slotProps={{
                                paper: {
                                    sx: {
                                        p: 3,
                                        width: 280,
                                        borderRadius: '1.5rem',
                                        mt: 1.5,
                                        bgcolor: 'white',
                                        '.dark &': {
                                            bgcolor: '#18181b',
                                            backgroundImage: 'none',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }
                                    }
                                }
                            }}
                        >
                            <Typography variant="subtitle2" sx={{
                                fontWeight: 900,
                                mb: 2,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'navy.main',
                                '.dark &': { color: 'white' }
                            }}>
                                Group Settings
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ position: 'relative', width: 80, height: 80, mx: 'auto', mb: 1 }}>
                                    <Avatar
                                        src={stagedGroupAvatar || journey?.groupAvatar}
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            border: '4px solid rgba(0,0,0,0.05)',
                                            '.dark &': { borderColor: 'rgba(255,255,255,0.1)' }
                                        }}
                                    />
                                    <IconButton
                                        component="label"
                                        sx={{
                                            position: 'absolute',
                                            bottom: -4,
                                            right: -4,
                                            bgcolor: 'forest.main',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'navy.main' },
                                            width: 32,
                                            height: 32,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <CameraIcon sx={{ fontSize: 16 }} />
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setUpdatingGroup(true);
                                                    const url = await uploadChatImage(file);
                                                    if (url) {
                                                        setStagedGroupAvatar(url);
                                                    }
                                                    setUpdatingGroup(false);
                                                }
                                            }}
                                        />
                                    </IconButton>
                                </Box>

                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Squad Name"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    label="Squad Name"
                                    sx={{
                                        '& .MuiInputLabel-root': { '.dark &': { color: 'slate.400' } },
                                        '& .MuiInputBase-input': { '.dark &': { color: 'white' } },
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { '.dark &': { borderColor: 'rgba(255,255,255,0.1)' } },
                                            '&:hover fieldset': { '.dark &': { borderColor: 'rgba(255,255,255,0.2)' } },
                                            '&.Mui-focused fieldset': { '.dark &': { borderColor: '#10B981' } }
                                        }
                                    }}
                                    slotProps={{
                                        input: { sx: { borderRadius: '1rem', fontWeight: 600 } }
                                    }}
                                />

                                <Button
                                    fullWidth
                                    variant="contained"
                                    disabled={updatingGroup || (newGroupName === journey?.groupName && !stagedGroupAvatar)}
                                    onClick={async () => {
                                        setUpdatingGroup(true);
                                        const updates: any = {};
                                        if (newGroupName !== journey?.groupName) updates.groupName = newGroupName;
                                        if (stagedGroupAvatar) updates.groupAvatar = stagedGroupAvatar;

                                        await updateJourney(journeyId, updates);
                                        setUpdatingGroup(false);
                                        setStagedGroupAvatar(null);
                                        setSettingsAnchorEl(null);
                                    }}
                                    sx={{
                                        borderRadius: '1rem',
                                        py: 1,
                                        fontWeight: 900,
                                        bgcolor: 'navy',
                                        '&:hover': { bgcolor: 'black' }
                                    }}
                                >
                                    {updatingGroup ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
                                </Button>
                            </Box>
                        </Popover>

                        <Popover
                            open={Boolean(emojiAnchorEl)}
                            anchorEl={emojiAnchorEl}
                            onClose={() => setEmojiAnchorEl(null)}
                            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                            transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
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
                            />
                        </Popover>

                        <TextField
                            fullWidth
                            placeholder="Type a message..."
                            variant="standard"
                            value={input}
                            onChange={handleInputChange}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            sx={{ px: 1 }}
                            slotProps={{
                                input: {
                                    disableUnderline: true,
                                    sx: {
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        '.dark &': { color: 'white' }
                                    }
                                }
                            }}
                        />

                        <Tooltip title="Send Message">
                            <IconButton
                                onClick={handleSend}
                                disabled={uploading || (!input.trim() && !selectedFile && !audioBlob)}
                                sx={{
                                    bgcolor: (input.trim() || selectedFile || audioBlob) ? '#22c55e' : 'transparent',
                                    color: (input.trim() || selectedFile || audioBlob) ? 'white' : 'text.disabled',
                                    '&:hover': { bgcolor: '#16a34a' },
                                    borderRadius: '1rem',
                                    transition: 'all 0.2s',
                                    width: 36,
                                    height: 36
                                }}
                            >
                                {uploading ? <CircularProgress size={16} color="inherit" /> : <SendIcon sx={{ fontSize: '1.1rem' }} />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            </Box>
        </Paper >
    );
}

function CallLogMessage({ msg }: { msg: Message }) {
    const { call_metadata: meta, created_at, sender_avatar, sender_name } = msg;
    if (!meta) return null;

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isMissed = meta.status === "missed";
    const isDeclined = meta.status === "declined";
    const isVideo = meta.type === "video";

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            my: 2,
            width: '100%'
        }}>
            <Paper elevation={0} sx={{
                px: 2,
                py: 1,
                borderRadius: '1.25rem',
                bgcolor: 'rgba(0,0,0,0.03)',
                '.dark &': { bgcolor: '#18181b', borderColor: 'rgba(255,255,255,0.05)' },
                border: '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                maxWidth: '80%',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.05)', transform: 'translateY(-1px)' }
            }}>
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                        <Box sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: isMissed || isDeclined ? '#ef4444' : '#22c55e',
                            color: 'white',
                            border: '2px solid white',
                            '.dark &': { border: '2px solid #1e293b' }
                        }}>
                            {isMissed ? <MissedIcon sx={{ fontSize: 12 }} /> : isDeclined ? <CloseIcon sx={{ fontSize: 12 }} /> : <AcceptedIcon sx={{ fontSize: 12 }} />}
                        </Box>
                    }
                >
                    <Avatar
                        src={sender_avatar}
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            border: '1px solid rgba(0,0,0,0.05)',
                            '.dark &': { border: '1px solid rgba(255,255,255,0.05)' }
                        }}
                    >
                        {sender_name?.[0]}
                    </Avatar>
                </Badge>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{
                        fontWeight: 900,
                        display: 'block',
                        color: 'navy.main',
                        fontSize: '0.75rem',
                        letterSpacing: '-0.01em',
                        '.dark &': { color: 'white' }
                    }}>
                        {isMissed ? 'Missed Call' : isDeclined ? 'Declined Call' : isVideo ? 'Video Call' : 'Audio Call'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.6 }}>
                        <Typography variant="caption" sx={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            '.dark &': { color: 'slate.400' }
                        }}>
                            {meta.status === "finished" ? `${formatDuration(meta.duration)} • ` : ''}
                            {dayjs(created_at).format('hh:mm A')}
                        </Typography>
                    </Box>
                </Box>
                {isVideo ? <VideoCallIcon fontSize="small" sx={{ opacity: 0.5, ml: 1 }} /> : <PhoneIcon fontSize="small" sx={{ opacity: 0.5, ml: 1 }} />}
            </Paper>
        </Box>
    );
}
