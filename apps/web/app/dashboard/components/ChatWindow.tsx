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
    Dialog,
    Stack,
    MenuItem,
    Switch,
    FormControlLabel
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
    ExitToApp as LeaveIcon,
    WorkOutlined as UtilityIcon,
    ReceiptLong as ExpenseIcon,
    FlightTakeoff as FlightIcon,
    VpnKey as VaultIcon,
    InfoOutlined as InfoIcon,
    Add as AddIcon,
    LocationOn as LocationIcon,
} from "@mui/icons-material";
import Image from "next/image";
import { useMessages, Message } from "../../../context/MessagesContext";
import { useCalling } from "../../../context/CallingContext";
import { useJourneys } from "../../../context/JourneysContext";
import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });
const MeetupMap = dynamic(() => import("./MeetupMap"), { ssr: false });
import { Theme as EmojiTheme } from "emoji-picker-react";

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
        getRequests,
        updateRequestStatus,
        leaveJourney,
        myRequests,
        addExpense,
        updateExpense,
        deleteExpense,
        getExpenses,
        getEmergencyContacts,
        saveEmergencyContact,
        deleteEmergencyContact,
        submitReview,
        recordSettlement,
        shareLocation,
        squadLocations,
        showNotification
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
    const [utilityAnchorEl, setUtilityAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseDesc, setExpenseDesc] = useState("");
    const [isExpenseHistoryOpen, setIsExpenseHistoryOpen] = useState(false);
    const [expenseHistory, setExpenseHistory] = useState<any[]>([]);
    const [editingExpense, setEditingExpense] = useState<any | null>(null);
    const [isVaultOpen, setIsVaultOpen] = useState(false);
    const [vaultContacts, setVaultContacts] = useState<any[]>([]);
    const [flightStatus, setFlightStatus] = useState<any>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [vaultForm, setVaultForm] = useState({ name: "", phone: "", relation: "" });
    const [isEditingVault, setIsEditingVault] = useState(false);
    const [isSettleFormOpen, setIsSettleFormOpen] = useState(false);
    const [selectedReceiver, setSelectedReceiver] = useState<{ id: string, name: string } | null>(null);
    const [settleAmount, setSettleAmount] = useState("");
    const [isMeetupMapOpen, setIsMeetupMapOpen] = useState(false);
    const [isSharingLocation, setIsSharingLocation] = useState(false);

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [leaving, setLeaving] = useState(false);


    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [participants, setParticipants] = useState<any[]>([]);
    const currentTypingUsers = typingUsers[journeyId] || [];
    const journey = journeys.find(j => j.id === journeyId);
    const isOwner = user?.id && journey?.userId && user.id.trim() === journey.userId.trim();
    const myStatus = myRequests[journeyId] || 'none';
    const isAccepted = isOwner || myStatus === 'accepted';
    const isPastTrip = !!(journey?.date && dayjs(journey.date).isBefore(dayjs(), 'day'));

    const handleAddExpense = async () => {
        if (!expenseAmount || !expenseDesc) return;
        await addExpense(journeyId, parseFloat(expenseAmount), expenseDesc);
        setIsExpenseModalOpen(false);
        setExpenseAmount("");
        setExpenseDesc("");
        await sendMessage(journeyId, `[EXPENSE] ${expenseDesc}: $${expenseAmount}`);
    };

    const handleSyncFlight = () => {
        setFlightStatus({
            status: "ON_TIME",
            gate: "B12",
            delay: "0m",
            baggage: "Carousel 4"
        });
        showNotification("Flight data synchronized!", "success");
    };

    const handleOpenVault = async () => {
        const contacts = await getEmergencyContacts(journeyId);
        setVaultContacts(contacts);
        setIsEditingVault(false);

        // Find existing contact for current user
        const myContact = contacts.find((c: any) => c.user_id === user?.id);
        if (myContact) {
            setVaultForm({
                name: myContact.contact_name,
                phone: myContact.contact_phone,
                relation: myContact.relation || ""
            });
        } else {
            setVaultForm({ name: "", phone: "", relation: "" });
        }

        setIsVaultOpen(true);
    };

    useEffect(() => {
        if (!isSharingLocation || !isMeetupMapOpen) return;

        const pulse = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    shareLocation(journeyId, pos.coords.latitude, pos.coords.longitude);
                }, (err) => {
                    console.warn("[MeetupMap] Geolocation error:", err);
                    setIsSharingLocation(false);
                    showNotification("Location sharing disabled. Check permissions.", "error");
                });
            }
        };

        pulse();
        const interval = setInterval(pulse, 10000);
        return () => clearInterval(interval);
    }, [isSharingLocation, isMeetupMapOpen, journeyId, shareLocation, showNotification]);

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
        const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
            if (scrollContainerRef.current) {
                if (behavior === "auto") {
                    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                } else {
                    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
                }
            }
        };

        if (!loading) {
            // Snappy snap on initial load or if few messages
            const behavior = messages.length <= 1 ? "auto" : "smooth";
            const timer = setTimeout(() => scrollToBottom(behavior), 100);
            return () => clearTimeout(timer);
        }
    }, [messages.length, currentTypingUsers.length, loading]);

    // Force snap on mount
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [journeyId]);

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

    if (!isAccepted && !loading) {
        return (
            <Box sx={{
                width: '100%',
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                textAlign: 'center',
                bgcolor: 'white',
                '.dark &': { bgcolor: '#09090b', color: 'white' },
                borderRadius: '1.5rem',
                gap: 2
            }}>
                <Box sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                    mb: 1
                }}>
                    <CloseIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>Access Restricted</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, maxWidth: 280 }}>
                    You must be an accepted participant or the owner to view this discussion.
                </Typography>
                {onClose && (
                    <Button onClick={onClose} variant="outlined" sx={{ mt: 2, borderRadius: '1rem', borderColor: 'rgba(0,0,0,0.1)', color: 'inherit' }}>
                        Close Discussion
                    </Button>
                )}
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width: '100%',
                height: "100%",
                display: "flex",
                flexDirection: "column",
                border: { xs: 'none', sm: "1px solid rgba(0,0,0,0.05)" },
                bgcolor: 'white',
                '.dark &': {
                    border: { xs: 'none', sm: '1px solid rgba(255,255,255,0.05)' },
                    bgcolor: '#09090b',
                    color: '#fafafa'
                },
                borderRadius: { xs: 0, sm: '1.5rem' },
                boxShadow: { xs: 'none', sm: '0 20px 50px rgba(0,0,0,0.1)' },
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            {/* Chat Header */}
            <Box sx={{
                p: 1.5,
                px: 2,
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
                            width: { xs: 36, sm: 32 },
                            height: { xs: 36, sm: 32 },
                            bgcolor: '#10B981',
                            fontSize: '14px',
                            fontWeight: 900
                        }}
                    >
                        {journey?.groupName?.charAt(0) || <ChatIcon sx={{ color: 'white' }} />}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" sx={{
                            fontWeight: 900,
                            color: '#1e293b',
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
                            fontSize: { xs: '0.75rem', sm: '0.65rem' },
                            mt: 0.5,
                            '.dark &': { color: 'slate.300 !important' }
                        }}>
                            <PeopleIcon sx={{ fontSize: 12, color: 'inherit' }} />
                            {participants.length + 1} {participants.length === 0 ? 'Member' : 'Members'} in Group
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title="Smart Utilities">
                        <IconButton
                            size="small"
                            onClick={(e) => setUtilityAnchorEl(e.currentTarget)}
                            sx={{
                                bgcolor: 'rgba(34, 197, 94, 0.1)',
                                color: '#10B981',
                                '&:hover': { bgcolor: '#10B981', color: 'white' }
                            }}
                        >
                            <UtilityIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>

                    {/* Utilities Popover */}
                    <Popover
                        open={Boolean(utilityAnchorEl)}
                        anchorEl={utilityAnchorEl}
                        onClose={() => setUtilityAnchorEl(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        slotProps={{
                            paper: {
                                sx: {
                                    mt: 1,
                                    borderRadius: '1.25rem',
                                    width: 240,
                                    p: 1,
                                    bgcolor: 'rgba(255,255,255,0.95)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    '.dark &': { bgcolor: 'rgba(24,24,27,0.95)' }
                                }
                            }
                        }
                        }>
                        <Box sx={{ p: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'slate.400', px: 1, mb: 1, display: 'block' }}>
                                Group Utilities
                            </Typography>
                            <Button
                                fullWidth
                                startIcon={<ExpenseIcon />}
                                onClick={() => { setIsExpenseModalOpen(true); setUtilityAnchorEl(null); }}
                                sx={{ justifyContent: 'flex-start', color: 'slate.700', '.dark &': { color: 'white' }, borderRadius: '10px', fontWeight: 700 }}
                            >
                                Split Expense
                            </Button>
                            <Button
                                fullWidth
                                startIcon={<FlightIcon />}
                                onClick={() => { handleSyncFlight(); setUtilityAnchorEl(null); }}
                                sx={{ justifyContent: 'flex-start', color: 'slate.700', '.dark &': { color: 'white' }, borderRadius: '10px', fontWeight: 700 }}
                            >
                                Sync Flight Data
                            </Button>
                            <Button
                                fullWidth
                                startIcon={<LocationIcon />}
                                onClick={() => { setIsMeetupMapOpen(true); setUtilityAnchorEl(null); }}
                                sx={{ justifyContent: 'flex-start', color: '#10B981', '.dark &': { color: '#34d399' }, borderRadius: '10px', fontWeight: 700 }}
                            >
                                Meetup Map
                            </Button>
                            <Button
                                fullWidth
                                startIcon={<VaultIcon />}
                                onClick={() => { handleOpenVault(); setUtilityAnchorEl(null); }}
                                sx={{ justifyContent: 'flex-start', color: 'slate.700', '.dark &': { color: 'white' }, borderRadius: '10px', fontWeight: 700 }}
                            >
                                Security Vault
                            </Button>
                        </Box>
                    </Popover>

                    {isOwner && (
                        <Tooltip title="Update Group Squad Identity">
                            <IconButton
                                onClick={(e) => setSettingsAnchorEl(e.currentTarget)}
                                size="small"
                                className="bg-green-500/10 text-green-600 dark:bg-white/10 dark:text-white"
                                sx={{ ml: 1 }}
                                aria-label="Update Group Settings"
                            >
                                <SettingsIcon sx={{ fontSize: 18 }} className="dark:text-white" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title={isPastTrip ? "Calling disabled for past trips" : "Audio Call"}>
                        <span>
                            <IconButton
                                onClick={() => startCall(journeyId, 'audio')}
                                disabled={isPastTrip}
                                size="small"
                                className={`text-green-600 dark:text-white ${isPastTrip ? 'opacity-30' : ''}`}
                                aria-label="Start Audio Call"
                            >
                                <PhoneIcon fontSize="small" className="dark:text-white" />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title={isPastTrip ? "Calling disabled for past trips" : "Video Call"}>
                        <span>
                            <IconButton
                                onClick={() => startCall(journeyId, 'video')}
                                disabled={isPastTrip}
                                size="small"
                                className={`text-green-600 dark:text-white ${isPastTrip ? 'opacity-30' : ''}`}
                                aria-label="Start Video Call"
                            >
                                <VideoCallIcon fontSize="small" className="dark:text-white" />
                            </IconButton>
                        </span>
                    </Tooltip>
                    {onClose && (
                        <IconButton
                            onClick={onClose}
                            size="small"
                            className="text-navy/60 dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
                            aria-label="Close Chat"
                            sx={{
                                padding: { xs: 1.5, sm: 1 } // Larger tap target on mobile
                            }}
                        >
                            <CloseIcon sx={{ fontSize: { xs: 24, sm: 20 } }} className="dark:text-white" />
                        </IconButton>
                    )}
                </Box>
            </Box>

            <Divider sx={{ opacity: 0.5 }} />

            {/* Flight Sync Sub-header */}
            {flightStatus && (
                <Box sx={{
                    px: 2,
                    py: 1,
                    bgcolor: 'rgba(34, 197, 94, 0.05)',
                    borderBottom: '1px solid rgba(34, 197, 94, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '.dark &': { bgcolor: 'rgba(34, 197, 94, 0.08)' }
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            px: 1,
                            py: 0.3,
                            borderRadius: '4px',
                            bgcolor: '#22c55e',
                            color: 'white',
                            fontSize: '9px',
                            fontWeight: 900
                        }}>
                            {flightStatus.status}
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534', '.dark &': { color: '#4ade80' } }}>
                            Gate {flightStatus.gate} • {flightStatus.delay} Delay
                        </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'slate.500', fontSize: '10px' }}>
                        Baggage: {flightStatus.baggage}
                    </Typography>
                </Box>
            )}

            {/* Messages Area */}
            <Box
                ref={scrollContainerRef}
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    p: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
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
                            if (msg.is_system) {
                                // ... existing system message logic (rendered by looking at msg.is_system)
                                return (
                                    <Box key={msg.id} sx={{ display: 'flex', justifyContent: 'center', my: 1, width: '100%' }}>
                                        <Box sx={{
                                            bgcolor: 'rgba(0,0,0,0.05)',
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: '1rem',
                                            border: '1px solid rgba(0,0,0,0.03)',
                                            '.dark &': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.05)' }
                                        }}>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                                {msg.content}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            }

                            // Expense Message Rendering
                            if (msg.content.startsWith('[EXPENSE]')) {
                                const parts = msg.content.replace('[EXPENSE] ', '').split(': ');
                                const desc = parts[0];
                                const amount = parts[1];
                                return (
                                    <Box key={msg.id} sx={{ display: 'flex', justifyContent: 'center', my: 1.5, width: '100%' }}>
                                        <Paper elevation={0} sx={{
                                            p: 1.5,
                                            borderRadius: '1.25rem',
                                            border: '1px solid #10B981',
                                            bgcolor: 'rgba(16, 185, 129, 0.05)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            maxWidth: '90%'
                                        }}>
                                            <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                <ExpenseIcon sx={{ fontSize: 20 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: '#065f46', '.dark &': { color: '#34d399' }, display: 'block', fontSize: '8px' }}>Added by {msg.sender_name}</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: 'navy.main', '.dark &': { color: 'white' } }}>{desc}</Typography>
                                            </Box>
                                            <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 900, color: '#10B981', fontSize: '1.1rem' }}>{amount}</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'slate.400', fontSize: '8px' }}>Split equally</Typography>
                                            </Box>
                                        </Paper>
                                    </Box>
                                );
                            }
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
                                        maxWidth: '92%'
                                    }}>
                                        <Avatar
                                            src={msg.sender_avatar?.includes('clerk.com') ? `${msg.sender_avatar}?height=60&width=60&fit=crop` : msg.sender_avatar}
                                            alt={msg.sender_name}
                                            sx={{ width: 28, height: 28, border: '1px solid rgba(0,0,0,0.1)' }}
                                            slotProps={{ img: { loading: 'lazy' } }}
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
                        <IconButton size="small" onClick={() => { setReplyingTo(null); setSelectedFile(null); setPreviewUrl(null); setAudioBlob(null); }} aria-label="Cancel preview">
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
                        <IconButton onClick={handleStopRecording} sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }} aria-label="Stop recording">
                            <StopIcon />
                        </IconButton>
                    </Box>
                ) : (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0,
                        bgcolor: 'rgba(0,0,0,0.03)',
                        '.dark &': { bgcolor: '#18181b', border: '1px solid rgba(255,255,255,0.05)' },
                        borderRadius: '1.25rem',
                        p: 0.5,
                        pl: 0.5
                    }}>
                        <IconButton
                            onClick={(e) => setEmojiAnchorEl(e.currentTarget)}
                            className="text-navy/60 dark:text-offwhite/40 hover:text-navy dark:hover:text-offwhite transition-colors"
                            aria-label="Add emoji"
                        >
                            <EmojiIcon sx={{ fontSize: 22 }} />
                        </IconButton>
                        <IconButton
                            onClick={() => fileInputRef.current?.click()}
                            className="text-navy/60 dark:text-offwhite/40 hover:text-navy dark:hover:text-offwhite transition-colors"
                            aria-label="Attach file"
                        >
                            <ImageIcon sx={{ fontSize: 22 }} />
                            <input type="file" hidden accept="image/*" onChange={handleFileSelect} />
                        </IconButton>

                        <Tooltip title="Record voice message">
                            <IconButton
                                onClick={handleStartRecording}
                                disabled={uploading}
                                className="text-navy/60 dark:text-white/60 hover:text-navy dark:hover:text-white"
                                aria-label="Record voice message"
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

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box sx={{ position: 'relative', width: 80, height: 80, mx: 'auto', mb: 0.5 }}>
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
                                            bgcolor: '#10B981',
                                            color: 'white',
                                            '&:hover': { bgcolor: '#059669' },
                                            width: 32,
                                            height: 32,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            zIndex: 10
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
                                        bgcolor: '#1e293b',
                                        '&:hover': { bgcolor: 'black' }
                                    }}
                                >
                                    {updatingGroup ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
                                </Button>

                                <Divider sx={{ my: 0.5, opacity: 0.1 }} />

                                <Typography variant="caption" sx={{
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    color: 'text.secondary',
                                    letterSpacing: '0.1em',
                                    mb: 0.5
                                }}>
                                    Participants ({participants.length})
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 200, overflowY: 'auto' }}>
                                    {participants.length === 0 ? (
                                        <Typography variant="caption" sx={{ opacity: 0.5, fontStyle: 'italic' }}>
                                            No other participants yet.
                                        </Typography>
                                    ) : (
                                        participants.map((p) => (
                                            <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar src={p.requester_avatar} sx={{ width: 24, height: 24 }} />
                                                    <Typography variant="caption" sx={{ fontWeight: 700, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {p.requester_name}
                                                    </Typography>
                                                </Box>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={async () => {
                                                        await updateRequestStatus(p.id, 'rejected');
                                                    }}
                                                    sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                                                    aria-label={`Remove ${p.requester_name}`}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Box>
                                        ))
                                    )}
                                </Box>

                                {!isOwner && (
                                    <>
                                        <Divider sx={{ my: 0.5, opacity: 0.1 }} />
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="error"
                                            startIcon={<LeaveIcon />}
                                            onClick={() => setIsLeaveModalOpen(true)}
                                            sx={{
                                                borderRadius: '1rem',
                                                textTransform: 'none',
                                                fontWeight: 800,
                                                borderColor: 'rgba(239, 68, 68, 0.2)',
                                                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.05)', borderColor: '#ef4444' }
                                            }}
                                        >
                                            Leave Group
                                        </Button>
                                    </>
                                )}
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
                            sx={{ px: 0.5 }}
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

            {/* Leave Confirmation Modal */}
            <Dialog
                open={isLeaveModalOpen}
                onClose={() => !leaving && setIsLeaveModalOpen(false)}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '1.5rem',
                            p: 2,
                            width: '100%',
                            maxWidth: 320,
                            bgcolor: 'white',
                            '.dark &': { bgcolor: '#18181b', backgroundImage: 'none' }
                        }
                    }
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, color: 'navy.main', '.dark &': { color: 'white' } }}>Leave Group?</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 3, color: 'text.secondary', '.dark &': { color: 'slate.400' } }}>
                    You will lose access to the chat history and the other participants will be notified.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                        onClick={() => setIsLeaveModalOpen(false)}
                        disabled={leaving}
                        sx={{ fontWeight: 800, textTransform: 'none', color: 'text.secondary' }}
                    >
                        Stay
                    </Button>
                    <Button
                        onClick={async () => {
                            setLeaving(true);
                            await leaveJourney(journeyId);
                            setLeaving(false);
                            setIsLeaveModalOpen(false);
                            if (onClose) onClose();
                        }}
                        disabled={leaving}
                        variant="contained"
                        color="error"
                        sx={{ borderRadius: '0.75rem', fontWeight: 900, textTransform: 'none', px: 3 }}
                    >
                        {leaving ? <CircularProgress size={20} color="inherit" /> : "Leave"}
                    </Button>
                </Box>
            </Dialog>

            {/* Add Expense Modal */}
            <Dialog
                open={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                slotProps={{ paper: { sx: { borderRadius: '1.5rem', p: 2, width: '100%', maxWidth: 360, '.dark &': { bgcolor: '#18181b', backgroundImage: 'none' } } } }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'navy.main', '.dark &': { color: 'white' } }}>Add Expense</Typography>
                    <Button
                        size="small"
                        startIcon={<UtilityIcon sx={{ fontSize: 14 }} />}
                        onClick={async () => {
                            const history = await getExpenses(journeyId);
                            setExpenseHistory(history);
                            setIsExpenseHistoryOpen(true);
                            setIsExpenseModalOpen(false);
                        }}
                        sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#10B981' }}
                    >
                        History
                    </Button>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 3, color: 'text.secondary', '.dark &': { color: 'slate.400' } }}>
                    Split a shared cost (taxi, lounge, snacks) with the group.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Amount ($)"
                        type="number"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        placeholder="e.g. Uber to Airport"
                        value={expenseDesc}
                        onChange={(e) => setExpenseDesc(e.target.value)}
                        variant="outlined"
                    />
                    <Button
                        fullWidth
                        onClick={handleAddExpense}
                        variant="contained"
                        sx={{ bgcolor: '#10B981', fontWeight: 900, py: 1.5, borderRadius: '1rem' }}
                    >
                        Share with Group
                    </Button>
                </Box>
            </Dialog>

            {/* Expense History Modal */}
            <Dialog
                open={isExpenseHistoryOpen}
                onClose={() => setIsExpenseHistoryOpen(false)}
                slotProps={{ paper: { sx: { borderRadius: '1.5rem', p: 3, width: '100%', maxWidth: 450, '.dark &': { bgcolor: '#18181b', backgroundImage: 'none' } } } }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <ExpenseIcon sx={{ color: '#10B981' }} />
                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'navy.main', '.dark &': { color: 'white' } }}>Expense History</Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 3, color: 'text.secondary', '.dark &': { color: 'slate.400' } }}>
                    Review or manage shared group costs.
                </Typography>

                {expenseHistory.length > 0 && (() => {
                    const sharedExps = expenseHistory.filter((e: any) => !e.is_settlement);
                    const totalShared = sharedExps.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0);
                    const share = totalShared / (participants.length + 1);
                    const paidByMe = sharedExps.filter((e: any) => e.payer_id === user?.id).reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0);
                    const settledByMe = expenseHistory.filter((e: any) => e.is_settlement && e.payer_id === user?.id).reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0);
                    const settledToMe = expenseHistory.filter((e: any) => e.is_settlement && e.receiver_id === user?.id).reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0);
                    const bal = (paidByMe + settledByMe) - (share + settledToMe);

                    return (
                        <Box sx={{ p: 2.5, mb: 3, borderRadius: '1.25rem', bgcolor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', '.dark &': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.6, display: 'block', letterSpacing: '0.5px' }}>TOTAL SPENT</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 900 }}>${totalShared.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.6, display: 'block', letterSpacing: '0.5px' }}>FAIR SHARE</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.secondary' }}>
                                        ${share.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ mb: 2, opacity: 0.5 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.6, display: 'block', letterSpacing: '0.5px' }}>SETTLEMENT STATUS</Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: bal >= 0 ? '#10B981' : '#ef4444' }}>
                                        {bal >= 0 ? (bal < 0.01 ? "All Settled!" : `You are owed $${bal.toFixed(2)}`) : `You owe $${Math.abs(bal).toFixed(2)}`}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    {bal < -0.01 && (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => {
                                                setSettleAmount(Math.abs(bal).toFixed(2));
                                                setIsSettleFormOpen(true);
                                            }}
                                            sx={{ borderRadius: '8px', fontWeight: 900, bgcolor: '#ef4444', mb: 0.5, fontSize: '10px' }}
                                        >
                                            Record Payment
                                        </Button>
                                    )}
                                    <Box sx={{ bgcolor: 'white', '.dark &': { bgcolor: 'rgba(255,255,255,0.05)' }, px: 2, py: 0.5, borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.6, display: 'block', textAlign: 'center', fontSize: '8px' }}>NET PAID</Typography>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900, textAlign: 'center', fontSize: '10px' }}>
                                            ${(paidByMe + settledByMe).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    );
                })()}

                <Stack spacing={2} sx={{ maxHeight: 400, overflowY: 'auto', p: 1 }}>
                    {expenseHistory.length === 0 ? (
                        <Box sx={{ py: 6, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '1rem', border: '1px dashed rgba(0,0,0,0.1)' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'slate.400' }}>No expenses recorded yet.</Typography>
                        </Box>
                    ) : (
                        expenseHistory.map((exp: any) => (
                            <Paper key={exp.id} elevation={0} sx={{
                                p: 2,
                                borderRadius: '12px',
                                border: '1px solid rgba(0,0,0,0.05)',
                                bgcolor: exp.is_settlement ? 'rgba(14, 165, 233, 0.03)' : 'rgba(16, 185, 129, 0.03)'
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                                            {exp.is_settlement ? `💸 Settlement: ${exp.description}` : exp.description}
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', fontWeight: 700 }}>
                                            {exp.is_settlement ? `From ${exp.payer_name} • ${dayjs(exp.created_at).format('MMM D, h:mm A')}` : `Paid by ${exp.payer_name} • ${dayjs(exp.created_at).format('MMM D, h:mm A')}`}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: exp.is_settlement ? '#0ea5e9' : '#10B981', '.dark &': { color: exp.is_settlement ? '#38bdf8' : '#34d399' } }}>
                                            ${parseFloat(exp.amount).toFixed(2)}
                                        </Typography>
                                        {exp.payer_id === user?.id && (
                                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, justifyContent: 'flex-end' }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setEditingExpense(exp)}
                                                    sx={{ p: 0.5, color: '#10B981' }}
                                                >
                                                    <EditIcon sx={{ fontSize: 14 }} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={async () => {
                                                        await deleteExpense(journeyId, exp.id, exp.description);
                                                        const updated = await getExpenses(journeyId);
                                                        setExpenseHistory(updated);
                                                    }}
                                                    sx={{ p: 0.5, color: '#ef4444' }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 14 }} />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>

                                {editingExpense?.id === exp.id && (
                                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <TextField
                                            size="small"
                                            label="Amount ($)"
                                            type="number"
                                            value={editingExpense.amount}
                                            onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                                        />
                                        <TextField
                                            size="small"
                                            label="Description"
                                            value={editingExpense.description}
                                            onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                                        />
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                fullWidth
                                                size="small"
                                                variant="contained"
                                                sx={{ bgcolor: '#10B981', borderRadius: '8px', fontWeight: 900 }}
                                                onClick={async () => {
                                                    await updateExpense(journeyId, exp.id, parseFloat(editingExpense.amount), editingExpense.description);
                                                    setEditingExpense(null);
                                                    const updated = await getExpenses(journeyId);
                                                    setExpenseHistory(updated);
                                                }}
                                            >
                                                Update
                                            </Button>
                                            <Button size="small" variant="outlined" onClick={() => setEditingExpense(null)}>Cancel</Button>
                                        </Box>
                                    </Box>
                                )}
                            </Paper>
                        ))
                    )}
                </Stack>
            </Dialog>

            {/* Record Settlement Modal */}
            <Dialog
                open={isSettleFormOpen}
                onClose={() => setIsSettleFormOpen(false)}
                slotProps={{ paper: { sx: { borderRadius: '1.5rem', p: 3, width: '100%', maxWidth: 350, '.dark &': { bgcolor: '#18181b', backgroundImage: 'none' } } } }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{ p: 1, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
                        <Typography sx={{ fontSize: '1.2rem' }}>💸</Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>Record Payment</Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
                    Log a peer-to-peer payment to settle your group balance.
                </Typography>

                <Stack spacing={2.5}>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        variant="outlined"
                        label="Who did you pay?"
                        value={selectedReceiver?.id || ""}
                        onChange={(e) => {
                            const p = participants.find((p: any) => p.requester_id === e.target.value);
                            if (p) setSelectedReceiver({ id: p.requester_id, name: p.requester_name });
                        }}
                    >
                        <MenuItem value="">Select participant...</MenuItem>
                        {participants.map((p: any) => (
                            <MenuItem key={p.requester_id} value={p.requester_id}>{p.requester_name}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        label="Amount Paid ($)"
                        type="number"
                        value={settleAmount}
                        onChange={(e) => setSettleAmount(e.target.value)}
                    />

                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            disabled={!selectedReceiver || !settleAmount}
                            onClick={async () => {
                                if (!selectedReceiver) return;
                                await recordSettlement(journeyId, parseFloat(settleAmount), selectedReceiver.id, selectedReceiver.name);
                                setIsSettleFormOpen(false);
                                setSettleAmount("");
                                setSelectedReceiver(null);
                                const updated = await getExpenses(journeyId);
                                setExpenseHistory(updated);
                            }}
                            sx={{ borderRadius: '12px', fontWeight: 900, bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
                        >
                            Confirm Payment
                        </Button>
                        <Button fullWidth variant="outlined" onClick={() => setIsSettleFormOpen(false)} sx={{ borderRadius: '12px', fontWeight: 900 }}>
                            Cancel
                        </Button>
                    </Box>
                </Stack>
            </Dialog>

            {/* Security Vault Modal */}
            <Dialog
                open={isVaultOpen}
                onClose={() => setIsVaultOpen(false)}
                slotProps={{ paper: { sx: { borderRadius: '1.5rem', p: 3, width: '100%', maxWidth: 400, '.dark &': { bgcolor: '#18181b', backgroundImage: 'none' } } } }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <VaultIcon sx={{ color: '#0ea5e9' }} />
                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'navy.main', '.dark &': { color: 'white' } }}>Security Vault</Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 3, color: 'text.secondary', '.dark &': { color: 'slate-400' } }}>
                    Shared emergency contacts. This data self-destructs 24h after flight landing.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 300, overflowY: 'auto', mb: 2 }}>
                    {vaultContacts.length === 0 ? (
                        <Box sx={{ py: 4, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '1rem', border: '1px dashed rgba(0,0,0,0.1)' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'slate.400' }}>No contacts shared yet.</Typography>
                        </Box>
                    ) : (
                        vaultContacts.map((contact, i) => (
                            <Paper key={i} elevation={0} sx={{ p: 1.5, borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', bgcolor: 'rgba(14, 165, 233, 0.03)' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{contact.contact_name}</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#0ea5e9', fontSize: '8px', textTransform: 'uppercase' }}>
                                        Shared by {contact.uploader_name || 'A Participant'}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, opacity: 0.6 }}>{contact.relation} • {contact.contact_phone}</Typography>
                            </Paper>
                        ))
                    )}
                </Box>

                <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '1.25rem', border: '1px solid rgba(0,0,0,0.05)', '.dark &': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'slate-500', textTransform: 'uppercase' }}>
                            {vaultContacts.some((c: any) => c.user_id === user?.id) ? 'Your Emergency Contact' : 'Add Your Contact'}
                        </Typography>
                        {vaultContacts.some((c: any) => c.user_id === user?.id) && (
                            <Stack direction="row" spacing={1}>
                                {!isEditingVault && (
                                    <Button
                                        size="small"
                                        onClick={() => setIsEditingVault(true)}
                                        sx={{ fontSize: '9px', fontWeight: 900, borderRadius: '8px', color: 'forest.main' }}
                                    >
                                        Edit
                                    </Button>
                                )}
                                <Button
                                    size="small"
                                    color="error"
                                    startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
                                    onClick={async () => {
                                        if (confirm("Remove your emergency contact from the vault?")) {
                                            await deleteEmergencyContact(journeyId);
                                            handleOpenVault();
                                        }
                                    }}
                                    sx={{ fontSize: '9px', fontWeight: 900, borderRadius: '8px' }}
                                >
                                    Delete
                                </Button>
                            </Stack>
                        )}
                    </Box>

                    {vaultContacts.some((c: any) => c.user_id === user?.id) && !isEditingVault ? (
                        <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.5)', dark: { bgcolor: 'rgba(255,255,255,0.05)' }, borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{vaultForm.name}</Typography>
                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, opacity: 0.6 }}>{vaultForm.relation} • {vaultForm.phone}</Typography>
                        </Box>
                    ) : (
                        <Stack spacing={1.5}>
                            <TextField
                                size="small"
                                placeholder="Full Name"
                                value={vaultForm.name}
                                onChange={(e) => setVaultForm({ ...vaultForm, name: e.target.value })}
                                sx={{ '.MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                            <TextField
                                size="small"
                                placeholder="Phone Number"
                                value={vaultForm.phone}
                                onChange={(e) => setVaultForm({ ...vaultForm, phone: e.target.value })}
                                sx={{ '.MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                            <TextField
                                size="small"
                                placeholder="Relation (e.g. Spouse)"
                                value={vaultForm.relation}
                                onChange={(e) => setVaultForm({ ...vaultForm, relation: e.target.value })}
                                sx={{ '.MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    disabled={!vaultForm.name || !vaultForm.phone}
                                    onClick={async () => {
                                        await saveEmergencyContact(journeyId, vaultForm.name, vaultForm.phone, vaultForm.relation);
                                        setIsEditingVault(false);
                                        handleOpenVault();
                                    }}
                                    sx={{ borderRadius: '0.75rem', fontWeight: 900, bgcolor: '#0ea5e9', '&:hover': { bgcolor: '#0284c7' } }}
                                >
                                    {vaultContacts.some((c: any) => c.user_id === user?.id) ? 'Update Vault' : 'Save to Vault'}
                                </Button>
                                {isEditingVault && (
                                    <Button
                                        variant="outlined"
                                        onClick={() => setIsEditingVault(false)}
                                        sx={{ borderRadius: '0.75rem', fontWeight: 900, color: 'text.secondary', borderColor: 'rgba(0,0,0,0.1)' }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </Box>
                        </Stack>
                    )}
                </Box>
            </Dialog>

            {/* Post-Journey Review Modal */}
            <Dialog
                open={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                slotProps={{ paper: { sx: { borderRadius: '1.5rem', p: 3, width: '100%', maxWidth: 400, '.dark &': { bgcolor: '#18181b', backgroundImage: 'none' } } } }}
            >
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, color: 'navy.main', '.dark &': { color: 'white' } }}>Rate your Companion</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 3, color: 'text.secondary', '.dark &': { color: 'slate-400' } }}>
                    Help build the trust community by rating your fellow traveler.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <IconButton key={star} onClick={() => {
                                // Logic for Star Rating selection
                                submitReview(journeyId, participants[0]?.requester_id || 'owner', star, "Great companion!");
                                setIsReviewModalOpen(false);
                            }}>
                                <SettingsIcon sx={{ fontSize: 32, color: '#eab308' }} />
                            </IconButton>
                        ))}
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Tap a star to submit review</Typography>
                </Box>
            </Dialog>

            {/* Meetup Map Modal */}
            <Dialog
                open={isMeetupMapOpen}
                fullScreen
                onClose={() => setIsMeetupMapOpen(false)}
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc', '.dark &': { bgcolor: '#0f172a' } }}>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.05)', '.dark &': { bgcolor: '#1e293b', borderColor: 'rgba(255,255,255,0.05)' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ p: 1, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                                <LocationIcon sx={{ color: '#10B981' }} />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>Meetup Map</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Find your squad in real-time</Typography>
                            </Box>
                        </Box>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={isSharingLocation}
                                        onChange={(e) => setIsSharingLocation(e.target.checked)}
                                        color="success"
                                        size="small"
                                    />
                                }
                                label={<Typography variant="caption" sx={{ fontWeight: 800 }}>LIVE SHARING</Typography>}
                                labelPlacement="start"
                            />
                            <IconButton onClick={() => setIsMeetupMapOpen(false)} sx={{ bgcolor: 'rgba(0,0,0,0.05)' }}>
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <MeetupMap locations={squadLocations} />
                    </Box>
                </Box>
            </Dialog>
        </Box>
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
                maxWidth: '95%',
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
                        alt={sender_name}
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
