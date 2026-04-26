'use client';

import { use, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useJourneys } from "../../../../context/JourneysContext";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import {
    Button,
    IconButton,
    Typography,
    Box,
    CircularProgress,
    AvatarGroup,
    Avatar,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Share as ShareIcon,
    WhatsApp as WhatsAppIcon,
    Email as MailIcon,
    Verified as VerifiedIcon,
    ChatBubbleOutlined as ChatIcon,
    Instagram as InstagramIcon,
    Edit as EditPenIcon,
    Mic as MicIcon,
    Stop as StopIcon,
    Delete as TrashIcon,
    PlayArrow as PlayIcon,
    Image as ImageIcon,
    CloudUpload as UploadIcon,
    AutoFixHigh as MagicIcon,
    CameraAlt as PhotoIcon,
    Star as KudosIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useUser } from '@clerk/nextjs';
const ChatWindow = dynamic(() => import('../../components/ChatWindow').then(mod => mod.ChatWindow), { ssr: false });
const RequestManager = dynamic(() => import('../../components/RequestManager').then(mod => mod.RequestManager), { ssr: false });
import { useMessages } from '../../../../context/MessagesContext';
import { ProfileBadge } from '../../components/ProfileBadge';
import { KudosModal } from '../../components/KudosModal';
import { KudosCabinet } from '../../components/KudosCabinet';
import { getUserKudos } from '../../../actions/kudos';

const JourneyMap = dynamic(() => import("../../components/JourneyMap"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-black/20 animate-pulse" />
});

// Simple coordinate lookup for demo
const airportCoords: Record<string, [number, number]> = {
    'DEL': [28.5562, 77.1000],
    'DXB': [25.2532, 55.3657],
    'LHR': [51.4700, -0.4543],
    'JFK': [40.6413, -73.7781],
    'SIN': [1.3644, 103.9915],
    'SFO': [37.6213, -122.3790],
    'SYD': [-33.9399, 151.1753],
    'HYD': [17.2403, 78.4294]
};

const getCoords = (name: string, routeData?: Record<string, [number, number]>): [number, number] => {
    const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795]; // Center of US
    if (!name) return DEFAULT_CENTER;

    const codeMatch = name.match(/\(([A-Z]{3})\)/);
    const code = (codeMatch ? codeMatch[1] : name.toUpperCase().trim()) || "";

    // 1. Try routeData from DB first (Dynamic)
    if (routeData && code && routeData[code]) return routeData[code];

    // 2. Try minimal fallbacks
    if (code && airportCoords[code]) return airportCoords[code];

    // 3. Common city matches
    const cityMatches: Record<string, string> = {
        'SAN FRANCISCO': 'SFO',
        'LONDON': 'LHR',
        'DUBAI': 'DXB',
        'SINGAPORE': 'SIN',
        'HYDERABAD': 'HYD',
        'DELHI': 'DEL',
        'NEW YORK': 'JFK'
    };

    const upperName = name.toUpperCase();
    for (const [city, cityCode] of Object.entries(cityMatches)) {
        if (upperName.includes(city) && airportCoords[cityCode]) {
            return airportCoords[cityCode];
        }
    }

    return DEFAULT_CENTER;
}

export default function JourneyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { journeys } = useJourneys();
    const [journey, setJourney] = useState<any>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const { user } = useUser();
    const { checkRequestStatus, sendRequest, showNotification, setActiveJourneyId, setIsChatOpen, uploadChatAudio } = useMessages();
    const { supabase } = useMessages() as any; // Access supabase for extra subscription if needed, or better, use subscribeToRequests
    const [requestStatus, setRequestStatus] = useState<'pending' | 'accepted' | 'rejected' | 'none'>('none');
    const [requestLoading, setRequestLoading] = useState(true);
    const [acceptedParticipants, setAcceptedParticipants] = useState<any[]>([]);

    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isKudosModalOpen, setIsKudosModalOpen] = useState(false);
    const [selectedReviewee, setSelectedReviewee] = useState<{ id: string, name: string, avatar: string } | null>(null);
    const [requestMessage, setRequestMessage] = useState("");
    const [submittingRequest, setSubmittingRequest] = useState(false);
    const [isDrafting, setIsDrafting] = useState(false);

    // Audio Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Trust Features State
    const [boardingPassFile, setBoardingPassFile] = useState<File | null>(null);
    const [boardingPassPreview, setBoardingPassPreview] = useState<string | null>(null);
    const [mutualCompanions, setMutualCompanions] = useState<string[]>([]);
    const [allKudos, setAllKudos] = useState<Record<string, any[]>>({});
    const { getMutualCompanions, uploadChatImage } = useMessages();

    const fetchAcceptedParticipants = useCallback(async () => {
        if (!supabase) return;
        const { data } = await supabase
            .from('journey_requests')
            .select('requester_id, requester_name, requester_avatar')
            .eq('journey_id', id)
            .eq('status', 'accepted');
        if (data) {
            setAcceptedParticipants(data);
            // Fetch kudos for everyone once participants are loaded
            const userIds = [journey?.userId, ...data.map((p: any) => p.requester_id)].filter(Boolean);
            const kudosMap: Record<string, any[]> = {};
            for (const uid of userIds) {
                const k = await getUserKudos(uid);
                kudosMap[uid] = k;
            }
            setAllKudos(kudosMap);
        }
    }, [id, supabase, journey?.userId]);

    const toggleChat = () => {
        const newState = !chatOpen;
        setChatOpen(newState);
        setIsChatOpen(newState);
    };

    const isOwner = user?.id && journey?.userId && user.id.trim() === journey.userId.trim();
    const isCompleted = journey?.status === 'completed';
    const isCancelled = journey?.status === 'cancelled';
    const isPastTrip = isCompleted || isCancelled || (journey?.date && dayjs(journey.date).isBefore(dayjs(), 'day'));

    useEffect(() => {
        if (journey) {
            console.log("[JourneyDetailPage] Status:", {
                userId: user?.id,
                journeyOwnerId: journey?.userId,
                isOwner
            });
        }
    }, [user?.id, journey, isOwner]);

    useEffect(() => {
        return () => {
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            if (recorderRef.current && recorderRef.current.state === "recording") {
                recorderRef.current.stop();
            }
        };
    }, []);

    // Notification suppression logic
    useEffect(() => {
        setActiveJourneyId(id);
        return () => setActiveJourneyId(null);
    }, [id, setActiveJourneyId]);

    useEffect(() => {
        const found = journeys.find((j: any) => j.id === id);
        if (found) {
            setJourney(found);
            setTimeout(() => setMapLoaded(true), 500);
            fetchAcceptedParticipants();

            // Initial status check
            if (user?.id && user.id !== found.userId && !isPastTrip) {
                checkRequestStatus(id).then(status => {
                    setRequestStatus(status);
                    setRequestLoading(false);
                });

                // Real-time status subscription
                if (supabase) {
                    const channel = supabase
                        .channel(`request_status_${id}_${user.id}`)
                        .on(
                            'postgres_changes',
                            {
                                event: 'UPDATE',
                                schema: 'public',
                                table: 'journey_requests',
                                filter: `journey_id=eq.${id}`,
                            },
                            (payload: any) => {
                                // If our own status changed
                                if (payload.new.requester_id === user.id) {
                                    const newStatus = payload.new.status;
                                    setRequestStatus(newStatus);
                                    if (newStatus === 'accepted') {
                                        showNotification("Request accepted! You can now join the discussion.", 'success');
                                    } else if (newStatus === 'rejected') {
                                        showNotification("Your request to pair was declined.", 'info');
                                    }
                                }
                                // Always refresh participant list if a status becomes accepted
                                if (payload.new.status === 'accepted') {
                                    fetchAcceptedParticipants();
                                }
                            }
                        )
                        .on(
                            'postgres_changes',
                            {
                                event: 'INSERT',
                                schema: 'public',
                                table: 'journey_requests',
                                filter: `journey_id=eq.${id}`,
                            },
                            (payload: any) => {
                                if (payload.new.status === 'accepted') {
                                    fetchAcceptedParticipants();
                                }
                            }
                        )
                        .subscribe();

                    return () => {
                        supabase.removeChannel(channel);
                    };
                }
            } else if (isPastTrip || (user?.id && user.id === found.userId)) {
                setRequestStatus('accepted');
                setRequestLoading(false);

                // If owner, also subscribe to all request changes to refresh participants
                if (user?.id === found.userId && supabase) {
                    const channel = supabase
                        .channel(`journey_participants_${id}`)
                        .on('postgres_changes', { event: '*', schema: 'public', table: 'journey_requests', filter: `journey_id=eq.${id}` }, () => {
                            fetchAcceptedParticipants();
                        })
                        .subscribe();
                    return () => supabase.removeChannel(channel);
                }
            } else {
                setRequestLoading(false);
            }
        } else {
            setRequestLoading(false);
        }
    }, [id, journeys, user?.id, checkRequestStatus, supabase, isPastTrip, showNotification, fetchAcceptedParticipants]);

    useEffect(() => {
        if (user?.id && journey?.userId && user.id !== journey.userId) {
            getMutualCompanions(user.id, journey.userId).then(setMutualCompanions);
        }
    }, [user?.id, journey?.userId, getMutualCompanions]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBoardingPassFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setBoardingPassPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };


    const handleShare = async () => {
        const shareData = {
            title: `Journey from ${journey?.from} to ${journey?.to}`,
            text: `Check out this journey on Journey-Mate! ${journey?.description}`,
            url: window.location.href,
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                showNotification('Shared successfully!', 'success');
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                showNotification('Link copied to clipboard!', 'success');
            } catch (err) {
                showNotification('Failed to copy link.', 'error');
            }
        }
    };

    const handleRequestAction = () => {
        setIsRequestModalOpen(true);
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
            showNotification("Could not access microphone.", 'error');
        }
    };

    const handleStopRecording = () => {
        if (recorderRef.current && recorderRef.current.state === "recording") {
            recorderRef.current.stop();
        }
        setIsRecording(false);
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };

    const handleAISuggest = async () => {
        setIsDrafting(true);
        try {
            // Simulated AI Generation based on journey description
            const desc = (journey?.description || '').toLowerCase();
            const to = journey?.to?.split(' (')[0] || '';

            let draft = `Hi! I'm also traveling to ${to} and would love to pair up. `;

            const matchRules = [
                { keywords: ['medical', 'nurse', 'doctor', 'rn'], draft: `I noticed you're looking for a companion with a medical background—I have experience in healthcare and would be happy to help out.` },
                { keywords: ['quiet', 'silent', 'relax'], draft: `I noticed you prefer a quiet flight—I'm an avid reader and usually stay focused on my book, so I think we'd be a great match.` },
                { keywords: ['help', 'luggage', 'assistance'], draft: `I saw you mentioned needing a hand with luggage—I'm quite fit and more than happy to help with the heavy lifting!` },
                { keywords: ['hindi', 'punjabi', 'telugu'], draft: `I noticed you mentioned shared languages—I'm bilingual and would love to have someone to chat with in our native tongue.` },
                { keywords: ['business', 'professional', 'work'], draft: `I noticed you're traveling for business—I'll also be catching up on some work, so I'd appreciate a professional companion.` },
                { keywords: ['family', 'kids', 'children'], draft: `I saw you're traveling with family—I'm very patient with kids and understand the dynamics of family travel.` }
            ];

            const matchedRule = matchRules.find(r => r.keywords.some(k => desc.includes(k)));
            if (matchedRule) {
                draft += matchedRule.draft;
            } else {
                draft += "I'm a frequent traveler and looking for a reliable companion to share this journey with.";
            }

            // Simulate "thinking" time
            await new Promise(resolve => setTimeout(resolve, 800));
            setRequestMessage(draft);
            showNotification("AI Suggestion applied!", 'success');
        } finally {
            setIsDrafting(false);
        }
    };

    const handleSubmitRequest = async () => {
        if (isRecording) {
            handleStopRecording();
            // Wait a tiny bit for the onstop handler to set the blob
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        setSubmittingRequest(true);
        try {
            let audioUrl = "";
            if (audioBlob) {
                const uploadedUrl = await uploadChatAudio(audioBlob);
                if (uploadedUrl) audioUrl = uploadedUrl;
            }

            const rating = (user?.unsafeMetadata?.rating as number) || 5.0;
            const verified = (user?.unsafeMetadata?.verified as boolean) ?? true;

            let boardingPassUrl = "";
            if (boardingPassFile) {
                const uploaded = await uploadChatImage(boardingPassFile);
                if (uploaded) boardingPassUrl = uploaded;
            }

            await sendRequest(id, requestMessage, rating, verified, audioUrl, boardingPassUrl);
            const newStatus = await checkRequestStatus(id);
            setRequestStatus(newStatus);
            setIsRequestModalOpen(false);
            setRequestMessage("");
            setAudioBlob(null);
            setRecordingDuration(0);
        } catch (err) {
            console.error("Error submitting request:", err);
        } finally {
            setSubmittingRequest(false);
        }
    };

    if (!journey) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <Typography variant="h6" className="font-black opacity-50 uppercase tracking-widest">Initializing...</Typography>
                </div>
            </div>
        );
    }

    const originCoords = getCoords(journey.from, journey.routeData);
    const destCoords = getCoords(journey.to, journey.routeData);

    const mapMarkers: any[] = [
        { position: originCoords, label: journey.from, type: 'origin' },
        { position: destCoords, label: journey.to, type: 'destination' }
    ];

    const mapRoute: [number, number][] = [originCoords];

    // Add all layovers
    if (journey.layovers && Array.isArray(journey.layovers)) {
        journey.layovers.forEach((l: string, idx: number) => {
            if (!l) return;
            const coords = getCoords(l, journey.routeData);
            mapMarkers.push({ position: coords, label: l, type: 'layover' });
            mapRoute.push(coords);
        });
    }

    mapRoute.push(destCoords);

    return (
        <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden font-inter">
            {/* 1. Fixed Background Map Layer */}
            <div className="fixed inset-0 z-0 h-screen w-screen">
                <div className={`w-full h-full transition-opacity duration-1000 ${mapLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <JourneyMap
                        center={[(originCoords[0] + destCoords[0]) / 2, (originCoords[1] + destCoords[1]) / 2]}
                        zoom={3}
                        markers={mapMarkers}
                        route={mapRoute}
                        isAnimated={true}
                    />
                </div>

                {/* Subtle vignette for edge focus */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_150px_rgba(0,0,0,0.3)]" />
            </div>

            {/* 2. Top Navigation - Adjusted to avoid dashboard nav overlap */}
            <header className="fixed top-[72px] left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
                <IconButton
                    onClick={() => router.back()}
                    className="pointer-events-auto"
                    aria-label="Go back"
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        '&:hover': { bgcolor: 'white', scale: 1.05 },
                        '@media (prefers-color-scheme: dark)': {
                            bgcolor: 'rgba(30,41,59,0.9)',
                            borderColor: 'rgba(255,255,255,0.1)',
                            '&:hover': { bgcolor: '#1e293b' }
                        }
                    }}
                >
                    <BackIcon sx={{ color: '#1e293b', '@media (prefers-color-scheme: dark)': { color: '#f8fafc' } }} />
                </IconButton>
                <div className="flex gap-4 pointer-events-auto">
                    <Button
                        variant="contained"
                        onClick={handleShare}
                        startIcon={<ShareIcon />}
                        sx={{
                            bgcolor: 'white',
                            color: '#1e293b',
                            borderRadius: '1rem',
                            px: 3,
                            py: 1,
                            fontWeight: 800,
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            '&:hover': { bgcolor: '#f8fafc' },
                            '@media (prefers-color-scheme: dark)': {
                                bgcolor: '#1e293b',
                                color: 'white',
                                borderColor: 'rgba(255,255,255,0.1)',
                                '&:hover': { bgcolor: '#334155' }
                            }
                        }}
                    >
                        Share
                    </Button>
                </div>
            </header>

            {/* 3. Content Area */}
            <div className="relative z-10 flex flex-col min-h-screen pointer-events-none lg:block">
                {/* Hero Spacer (Mobile/Tablet only) - Shows the map */}
                <div className="h-[55vh] lg:hidden flex flex-col justify-end p-8 transition-all duration-700">
                    <div className={`transition-all duration-1000 ${mapLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-8 py-5 rounded-3xl border border-white/20 dark:border-white/5 shadow-2xl flex flex-col items-center">
                                <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 dark:text-slate-500 uppercase mb-1">
                                    {journey.airlineName || 'FLIGHT'}
                                </span>
                                <div className="flex items-center gap-3">
                                    {journey.flightNumber && (
                                        <div className="relative w-8 h-8">
                                            <Image
                                                src={`https://www.gstatic.com/flights/airline_logos/70px/${journey.flightNumber.match(/^[A-Z0-9]{2}/)?.[0] || 'AA'}.png`}
                                                alt={`${journey.flightNumber} logo`}
                                                fill
                                                className="object-contain"
                                                sizes="32px"
                                                priority
                                            />
                                        </div>
                                    )}
                                    <span className="text-2xl font-black text-slate-800 dark:text-white">{journey.flightNumber}</span>
                                </div>
                                {journey.layovers && journey.layovers.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1 justify-center">
                                        {journey.layovers.map((l: string, i: number) => (
                                            <div key={i} className="text-[9px] font-bold text-sand-dark dark:text-sand/80 px-2.5 py-1 bg-sand/10 dark:bg-sand/5 rounded-lg border border-sand/10">
                                                LAYOVER: {l}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Sheet (Bottom on Mobile, Side on Desktop) */}
                <aside className={`
                    bg-white dark:bg-slate-900 shadow-[0_-20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.3)] pointer-events-auto transition-all duration-700
                    /* Mobile styles */
                    rounded-t-[3rem] mx-2 -mt-6 pb-24 border-x border-t border-slate-100 dark:border-slate-800 relative z-20
                    /* Desktop Styles */
                    lg:fixed lg:right-0 lg:top-0 lg:h-screen lg:w-[480px] lg:m-0 lg:rounded-none lg:rounded-l-[3.5rem] lg:pb-12 lg:overflow-y-auto lg:border-t-0 lg:z-[60] lg:mt-0
                    ${mapLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
                `}>
                    {/* Visual indicators for different modes */}
                    <div className="lg:hidden w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto my-6" />
                    <div className="hidden lg:block pt-24" />

                    <div className="px-6 lg:px-8">
                        {/* Hero Info - Desktop Version (Visible only on lg) */}
                        <div className="hidden lg:flex items-center gap-4 mb-6">
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 inline-flex flex-col items-center">
                                <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 dark:text-slate-500 uppercase">
                                    {journey.airlineName || 'FLIGHT'}
                                </span>
                                <div className="flex items-center gap-3">
                                    {(journey.airlineIata || journey.flightNumber) && (
                                        <div className="relative w-6 h-6">
                                            <Image
                                                src={`https://www.gstatic.com/flights/airline_logos/70px/${journey.airlineIata || journey.flightNumber?.match(/^[A-Z0-9]{2}/)?.[0]}.png`}
                                                alt={`${journey.airlineName || 'Airline'} logo`}
                                                fill
                                                className="object-contain"
                                                sizes="24px"
                                                priority
                                            />
                                        </div>
                                    )}
                                    <span className="text-xl font-black text-slate-800 dark:text-white">{journey.flightNumber}</span>
                                </div>
                            </div>
                            {journey.layovers && journey.layovers.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {journey.layovers.map((l: string, i: number) => (
                                        <div key={i} className="bg-amber-50/50 dark:bg-amber-900/10 px-4 py-2 rounded-2xl border border-amber-100/50 dark:border-amber-900/20">
                                            <span className="text-[9px] font-black text-amber-600/80 dark:text-amber-500/80 uppercase block">LAYOVER</span>
                                            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{l}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Header Info in Sheet */}
                        <div className="flex flex-col mb-8">
                            <div className="flex items-center gap-3 flex-wrap">
                                <Box>
                                    {journey.groupName && (
                                        <Typography sx={{ color: 'forest.main', fontWeight: 900, mb: 1, letterSpacing: '0.1em', fontSize: '10px', textTransform: 'uppercase' }}>
                                            {journey.groupName}
                                        </Typography>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                            {journey.from.split(' (')[0]} → {journey.to.split(' (')[0]}
                                        </h1>
                                        {isOwner && (
                                            <Tooltip title="Edit Group Identity">
                                                <Box sx={{ flexShrink: 0 }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={toggleChat}
                                                        aria-label="Edit Group Identity"
                                                        sx={{
                                                            bgcolor: 'rgba(34, 197, 94, 0.1)',
                                                            color: 'forest.main',
                                                            border: '1px solid rgba(34, 197, 94, 0.2)',
                                                            '&:hover': { bgcolor: 'forest.main', color: 'white' }
                                                        }}
                                                    >
                                                        <EditPenIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </div>
                                </Box>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-bold tracking-tight mt-1 px-1">
                                Scheduled for {dayjs(journey.date).format('dddd, MMMM DD')}
                            </p>

                            {journey.boardingPassUrl && (
                                <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-forest/10 dark:bg-forest/20 border border-forest/20 rounded-2xl w-fit animate-in fade-in slide-in-from-bottom-2 duration-700">
                                    <VerifiedIcon sx={{ fontSize: 16, color: '#10B981' }} />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-forest uppercase tracking-widest leading-none mb-0.5">Verified Journey</span>
                                        <span className="text-[9px] font-bold text-forest/70 dark:text-forest/60">Boarding Pass Uploaded</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-10">
                            {/* User Profile Section - Cleaner and More Integrated */}
                            <div className="flex items-center gap-6 group relative">
                                <div className="relative flex-shrink-0">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white dark:ring-slate-800 transition-all group-hover:scale-105 relative">
                                        <Image
                                            src={journey.user.avatar?.includes('clerk.com') ? `${journey.user.avatar}?height=128&width=128&fit=crop` : journey.user.avatar}
                                            alt={journey.user.name}
                                            fill
                                            className="object-cover"
                                            priority
                                            sizes="64px"
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-sky-500 p-1 rounded-lg border-2 border-white dark:border-slate-800 shadow-sm z-10">
                                        <VerifiedIcon sx={{ color: 'white', fontSize: 10 }} />
                                    </div>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate">{journey.user.name}</h2>
                                        <ProfileBadge tier={journey.user.verificationTier} />
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                            TRAVELER PROFILE
                                        </span>
                                        <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 rounded-lg text-[9px] font-black whitespace-nowrap">
                                            {journey.user.rating > 0 ? `★ ${journey.user.rating.toFixed(1)}` : 'NEW MEMBER'}
                                        </span>
                                    </div>

                                    {/* Mates Joined Section */}
                                    {acceptedParticipants.length > 0 && (
                                        <div className="mt-4 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700 w-fit">
                                            <AvatarGroup max={4} sx={{
                                                '& .MuiAvatar-root': {
                                                    width: 28,
                                                    height: 28,
                                                    fontSize: 10,
                                                    fontWeight: 900,
                                                    border: '2px solid white',
                                                    '.dark &': { border: '2px solid #1e293b' }
                                                }
                                            }}>
                                                {acceptedParticipants.map((p: any) => (
                                                    <Avatar key={p.requester_id} src={p.requester_avatar} alt={p.requester_name}>
                                                        {p.requester_name?.charAt(0)}
                                                    </Avatar>
                                                ))}
                                            </AvatarGroup>
                                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                {acceptedParticipants.length} {acceptedParticipants.length === 1 ? 'Mate' : 'Mates'} Joined
                                            </span>
                                        </div>
                                    )}

                                    {/* Mutual Connections Badge */}
                                    {mutualCompanions.length > 0 && !isOwner && (
                                        <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl w-fit">
                                            <VerifiedIcon sx={{ fontSize: 14, color: '#10B981' }} />
                                            <Typography sx={{ fontSize: '10px', fontWeight: 900, color: '#065f46', '.dark &': { color: '#34d399' }, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                                You both know {mutualCompanions[0]}{mutualCompanions.length > 1 ? ` & ${mutualCompanions.length - 1} more` : ''}
                                            </Typography>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Main Actions Area - Prominent and Clean */}
                            <div className="space-y-3">
                                {requestLoading ? (
                                    <Box sx={{ py: 3, textAlign: 'center' }}>
                                        <CircularProgress size={24} sx={{ color: 'navy', '.dark &': { color: 'white' } }} />
                                    </Box>
                                ) : (isOwner || requestStatus === 'accepted' || isPastTrip) ? (
                                    <Stack spacing={2}>
                                        {!isOwner && (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={() => {
                                                    setSelectedReviewee({
                                                        id: journey.userId!,
                                                        name: journey.user.name,
                                                        avatar: journey.user.avatar
                                                    });
                                                    setIsKudosModalOpen(true);
                                                }}
                                                startIcon={(allKudos[journey.userId] || []).some(k => k.reviewer_id === user?.id) ? <VerifiedIcon /> : <KudosIcon />}
                                                disabled={(allKudos[journey.userId] || []).some(k => k.reviewer_id === user?.id)}
                                                sx={{
                                                    bgcolor: (allKudos[journey.userId] || []).some(k => k.reviewer_id === user?.id) ? 'slate.400' : '#fbbf24',
                                                    color: 'black',
                                                    borderRadius: '1rem',
                                                    py: 1.5,
                                                    fontWeight: 900,
                                                    textTransform: 'none',
                                                    fontSize: '0.95rem',
                                                    letterSpacing: '-0.02em',
                                                    boxShadow: '0 10px 20px -5px rgba(251, 191, 36, 0.3)',
                                                    '&:hover': { bgcolor: (allKudos[journey.userId] || []).some(k => k.reviewer_id === user?.id) ? 'slate.400' : '#f59e0b' },
                                                    '.dark &': {
                                                        bgcolor: (allKudos[journey.userId] || []).some(k => k.reviewer_id === user?.id) ? 'slate.700' : '#fbbf24',
                                                        color: 'black'
                                                    }
                                                }}
                                            >
                                                {(allKudos[journey.userId] || []).some(k => k.reviewer_id === user?.id)
                                                    ? "Kudos Shared"
                                                    : `Leave Kudos for ${journey.user.name.split(' ')[0]}`}
                                            </Button>
                                        )}
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => router.push(`/dashboard/archive/${id}`)}
                                            startIcon={<PhotoIcon />}
                                            sx={{
                                                bgcolor: 'forest.main',
                                                color: 'white',
                                                borderRadius: '1rem',
                                                py: 1.5,
                                                fontWeight: 900,
                                                textTransform: 'none',
                                                fontSize: '0.95rem',
                                                letterSpacing: '-0.02em',
                                                boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)',
                                                '&:hover': { bgcolor: 'forest.dark' }
                                            }}
                                        >
                                            View Journey Memories
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={toggleChat}
                                            startIcon={<ChatIcon />}
                                            sx={{
                                                bgcolor: '#09090b',
                                                color: 'white',
                                                borderRadius: '1rem',
                                                py: 1.5,
                                                fontWeight: 900,
                                                textTransform: 'none',
                                                fontSize: '0.95rem',
                                                letterSpacing: '-0.02em',
                                                boxShadow: '0 10px 20px -5px rgba(15, 23, 42, 0.3)',
                                                '&:hover': { bgcolor: 'black', scale: 1.01 },
                                                '.dark &': {
                                                    bgcolor: 'white',
                                                    color: '#09090b',
                                                    boxShadow: '0 10px 20px -5px rgba(255, 255, 255, 0.1)',
                                                    '&:hover': { bgcolor: '#f1f5f9' }
                                                }
                                            }}
                                        >
                                            {isCompleted ? "View Discussion Archive" : isCancelled ? "Trip Cancelled" : "Open Group Chat"}
                                        </Button>
                                    </Stack>
                                ) : requestStatus === 'pending' ? (
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        disabled
                                        sx={{
                                            borderRadius: '1rem',
                                            py: 1.5,
                                            fontWeight: 900,
                                            textTransform: 'none',
                                            fontSize: '0.95rem',
                                            opacity: 0.6,
                                            borderWidth: '2px !important',
                                            color: 'slate.400',
                                            borderColor: 'slate.200 !important',
                                            '.dark &': { color: 'slate.500', borderColor: 'slate.800 !important' }
                                        }}
                                    >
                                        Request Sent (Pending)
                                    </Button>
                                ) : requestStatus === 'rejected' ? (
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        disabled
                                        color="error"
                                        sx={{
                                            borderRadius: '1.5rem',
                                            py: 2.5,
                                            fontWeight: 900,
                                            textTransform: 'none',
                                            fontSize: '1.1rem',
                                            borderWidth: '2px !important',
                                            '.dark &': { borderColor: 'error.main', color: 'error.main', opacity: 0.5 }
                                        }}
                                    >
                                        Request Declined
                                    </Button>
                                ) : (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleRequestAction}
                                        startIcon={<ChatIcon />}
                                        sx={{
                                            bgcolor: '#10B981', // forest
                                            color: 'white',
                                            borderRadius: '1rem',
                                            py: 1.5,
                                            fontWeight: 900,
                                            textTransform: 'none',
                                            fontSize: '0.95rem',
                                            letterSpacing: '-0.02em',
                                            boxShadow: '0 10px 20px -5px rgba(34, 197, 94, 0.3)',
                                            '&:hover': { bgcolor: '#059669', scale: 1.01 },
                                            '.dark &': {
                                                bgcolor: '#10B981',
                                                color: 'white',
                                                boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.2)'
                                            }
                                        }}
                                    >
                                        Request to Pair
                                    </Button>
                                )}

                                {isOwner && !isPastTrip && (
                                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                        <RequestManager journeyId={id} />
                                    </div>
                                )}

                                {journey.boardingPassUrl && isOwner && (
                                    <div className="mt-8 bg-slate-50 dark:bg-white/5 p-5 rounded-[2rem] border border-slate-100 dark:border-white/10 overflow-hidden">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">YOUR BOARDING PASS</h3>
                                        <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-inner">
                                            <Image
                                                src={journey.boardingPassUrl}
                                                alt="Boarding Pass"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <p className="text-[9px] text-gray-500 mt-3 italic text-center">Only you can see the full ticket image. Others see a verification badge.</p>
                                    </div>
                                )}
                            </div>

                            {/* Secondary Actions / Connect Section - More Compact */}
                            {journey.contactInfo && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-5 border border-slate-100 dark:border-slate-700">
                                    <h2 className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">CONNECT WITH OWNER</h2>
                                    <div className="flex flex-col gap-3">
                                        {(() => {
                                            const contact = journey.contactInfo;
                                            const cleanPhone = contact.replace(/[\s\-\+\(\)]/g, '');
                                            const isEmail = contact.includes('@') && !contact.startsWith('@');
                                            const isWhatsApp = /^\d+$/.test(cleanPhone) && cleanPhone.length > 5;
                                            const isInsta = contact.startsWith('@') || (contact.length > 2 && !isEmail && !isWhatsApp);

                                            return (
                                                <>
                                                    {isEmail && (
                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            startIcon={<MailIcon sx={{ fontSize: 18 }} />}
                                                            onClick={() => window.open(`mailto:${contact}`, '_blank')}
                                                            sx={{
                                                                bgcolor: 'white',
                                                                color: '#09090b',
                                                                borderRadius: '1rem',
                                                                py: 1.5,
                                                                fontWeight: 900,
                                                                textTransform: 'none',
                                                                fontSize: '0.85rem',
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                                border: '1px solid',
                                                                borderColor: 'slate.200',
                                                                '&:hover': { bgcolor: '#f8fafc', borderColor: 'slate.300', scale: 1.02 },
                                                                '.dark &': {
                                                                    bgcolor: '#334155',
                                                                    color: 'white',
                                                                    borderColor: 'white/10',
                                                                    '&:hover': { bgcolor: 'white/20', borderColor: 'white/20' }
                                                                }
                                                            }}
                                                        >
                                                            Send Email
                                                        </Button>
                                                    )}

                                                    {isInsta && (
                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            startIcon={<InstagramIcon sx={{ fontSize: 18 }} />}
                                                            onClick={() => window.open(`https://instagram.com/${contact.replace('@', '')}`, '_blank')}
                                                            sx={{
                                                                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                                                                color: 'white',
                                                                borderRadius: '1rem',
                                                                py: 1.5,
                                                                fontWeight: 900,
                                                                textTransform: 'none',
                                                                fontSize: '0.85rem',
                                                                boxShadow: '0 4px 12px rgba(220, 39, 67, 0.2)',
                                                                '&:hover': { opacity: 0.9, scale: 1.02 }
                                                            }}
                                                        >
                                                            Instagram DM
                                                        </Button>
                                                    )}

                                                    {isWhatsApp && (
                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            startIcon={<WhatsAppIcon sx={{ fontSize: 18 }} />}
                                                            onClick={() => window.open(`https://wa.me/${cleanPhone}`, '_blank')}
                                                            sx={{
                                                                bgcolor: '#22c55e',
                                                                color: 'white',
                                                                borderRadius: '1rem',
                                                                py: 1.5,
                                                                fontWeight: 900,
                                                                textTransform: 'none',
                                                                fontSize: '0.85rem',
                                                                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
                                                                '&:hover': { bgcolor: '#16a34a', scale: 1.02 }
                                                            }}
                                                        >
                                                            WhatsApp Chat
                                                        </Button>
                                                    )}

                                                    {!isEmail && !isInsta && !isWhatsApp && (
                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            startIcon={<ChatIcon sx={{ fontSize: 18 }} />}
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(contact);
                                                                showNotification("Contact info copied to clipboard!", "success");
                                                            }}
                                                            sx={{
                                                                bgcolor: 'white',
                                                                color: '#09090b',
                                                                borderRadius: '1rem',
                                                                py: 1.5,
                                                                fontWeight: 900,
                                                                textTransform: 'none',
                                                                fontSize: '0.85rem',
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                                border: '1px solid',
                                                                borderColor: 'slate.200',
                                                                '&:hover': { bgcolor: '#f8fafc', borderColor: 'slate.300', scale: 1.02 },
                                                                '.dark &': {
                                                                    bgcolor: '#334155',
                                                                    color: 'white',
                                                                    borderColor: 'white/10',
                                                                    '&:hover': { bgcolor: 'white/20', borderColor: 'white/20' }
                                                                }
                                                            }}
                                                        >
                                                            Copy: {contact}
                                                        </Button>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Companion Trust Wall */}
                            {(() => {
                                const ownerId = journey?.userId;
                                const ownerReviews = ownerId ? (allKudos[ownerId] || []) : [];
                                const hasReviews = ownerReviews.length > 0 || acceptedParticipants.some(p => (allKudos[p.requester_id]?.length || 0) > 0);

                                if (!ownerId || !hasReviews) return null;

                                return (
                                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] p-6 border border-slate-100 dark:border-white/5">
                                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                            <KudosIcon sx={{ fontSize: 14, color: '#fbbf24' }} /> COMPANION TRUST WALL
                                        </h2>
                                        <Stack spacing={4}>
                                            {ownerReviews.length > 0 && (
                                                <KudosCabinet
                                                    reviews={ownerReviews}
                                                    userName={journey?.user?.name || 'Owner'}
                                                />
                                            )}
                                            {acceptedParticipants.map(p => {
                                                const pReviews = allKudos[p.requester_id] || [];
                                                if (pReviews.length === 0) return null;
                                                return (
                                                    <KudosCabinet
                                                        key={p.requester_id}
                                                        reviews={pReviews}
                                                        userName={p.requester_name || 'Companion'}
                                                    />
                                                );
                                            })}
                                        </Stack>
                                    </div>
                                );
                            })()}

                            {/* Details Section */}
                            <div className="space-y-6">
                                <div className="p-6 bg-sky-50/50 dark:bg-sky-900/10 rounded-[2.5rem] border border-sky-100/50 dark:border-sky-800/30">
                                    <h2 className="text-[10px] font-black text-sky-700 dark:text-sky-400 uppercase tracking-[0.2em] mb-4">MATCH NOTES</h2>
                                    <p className="text-xl font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                        "{journey.description}"
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {journey.tags.map((tag: string, idx: number) => (
                                        <span
                                            key={idx}
                                            className="px-5 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest border border-slate-200 dark:border-slate-700"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Floating Chat Box */}
            <Box sx={{
                position: 'fixed',
                bottom: { xs: 0, sm: 24 },
                right: { xs: 0, sm: 24 },
                zIndex: 1300,
                width: { xs: '100%', sm: 420 },
                height: { xs: '100%', sm: 750 },
                maxHeight: { xs: '100%', sm: 'calc(100vh - 80px)' },
                pointerEvents: chatOpen ? 'auto' : 'none',
                opacity: chatOpen ? 1 : 0,
                transform: chatOpen ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: chatOpen ? 'block' : 'none'
            }}>
                <ChatWindow journeyId={id} onClose={() => {
                    setChatOpen(false);
                    setIsChatOpen(false);
                }} />
            </Box>

            {/* Request Join Modal */}
            <Dialog
                open={isRequestModalOpen}
                onClose={() => !submittingRequest && setIsRequestModalOpen(false)}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '2rem',
                            p: 1,
                            width: '100%',
                            maxWidth: 400,
                            bgcolor: 'white',
                            '.dark &': { bgcolor: '#18181b', backgroundImage: 'none' }
                        }
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, pb: 1, '.dark &': { color: 'white' } }}>Request to Pair</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 3, opacity: 0.7, '.dark &': { color: 'slate.300', opacity: 0.9 } }}>
                        Tell the journey owner why you'd like to join their trip and any assistance you can provide or require.
                    </Typography>
                    <Box sx={{ position: 'relative' }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="e.g. I'm also traveling with heavy luggage and could use a hand, or I'm happy to help navigate!"
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                            variant="outlined"
                            slotProps={{
                                input: {
                                    sx: {
                                        borderRadius: '1.25rem',
                                        bgcolor: 'rgba(0,0,0,0.02)',
                                        '.dark &': { bgcolor: 'rgba(255,255,255,0.03)', color: 'white' },
                                        pr: 6
                                    }
                                }
                            }}
                        />
                        <Tooltip title="AI Suggest Content">
                            <IconButton
                                onClick={handleAISuggest}
                                disabled={isDrafting}
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: 8,
                                    color: '#0ea5e9',
                                    bgcolor: 'rgba(14, 165, 233, 0.05)',
                                    '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.1)' }
                                }}
                            >
                                {isDrafting ? <CircularProgress size={20} color="inherit" /> : <MagicIcon sx={{ fontSize: 20 }} />}
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Boarding Pass Upload UI */}
                    <Box sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: '1.25rem',
                        border: '1px dashed rgba(0,0,0,0.1)',
                        bgcolor: 'rgba(16, 185, 129, 0.02)',
                        '.dark &': { borderColor: 'rgba(255,255,255,0.1)', bgcolor: 'rgba(255,255,255,0.01)' },
                        textAlign: 'center',
                        position: 'relative',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.05)', borderColor: '#10B981' }
                    }}>
                        <input
                            type="file"
                            accept="image/*"
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }}
                            onChange={handleFileChange}
                        />
                        {boardingPassPreview ? (
                            <Box sx={{ position: 'relative', height: 120, width: '100%', borderRadius: '1rem', overflow: 'hidden' }}>
                                <Image src={boardingPassPreview} alt="Boarding Pass Preview" fill style={{ objectFit: 'cover' }} />
                                <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', opacity: 0, '&:hover': { opacity: 1 }, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 900 }}>Click to change</Typography>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                <UploadIcon sx={{ color: '#10B981', opacity: 0.6 }} />
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'forest.main', '.dark &': { color: 'sand.main' } }}>
                                        Attach Boarding Pass
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.5, display: 'block', '.dark &': { color: 'slate.400', opacity: 0.8 } }}>
                                        Highly recommended for trust (Optional)
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Audio Recorder UI */}
                    <Box sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: '1.25rem',
                        border: '1px solid rgba(0,0,0,0.05)',
                        bgcolor: 'rgba(0,0,0,0.01)',
                        '.dark &': {
                            borderColor: 'rgba(255,255,255,0.1)',
                            bgcolor: 'rgba(255,255,255,0.01)'
                        }
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    bgcolor: isRecording ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: isRecording ? '#ef4444' : '#10B981',
                                    position: 'relative'
                                }}>
                                    {isRecording && (
                                        <Box sx={{
                                            position: 'absolute',
                                            inset: -4,
                                            borderRadius: '50%',
                                            border: '2px solid #ef4444',
                                            animation: 'pulse 1.5s infinite ease-in-out',
                                            '@keyframes pulse': {
                                                '0%': { transform: 'scale(0.8)', opacity: 0.8 },
                                                '100%': { transform: 'scale(1.2)', opacity: 0 }
                                            }
                                        }} />
                                    )}
                                    {isRecording ? <StopIcon sx={{ fontSize: 20 }} /> : <MicIcon sx={{ fontSize: 20 }} />}
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 800, '.dark &': { color: 'white' } }}>
                                        {isRecording ? "Recording..." : audioBlob ? "Voice Greeting recorded" : "Voice Greeting"}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.5, '.dark &': { color: 'slate.400', opacity: 0.8 } }}>
                                        {isRecording ? `${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')}` : audioBlob ? "Click to remove and re-record" : "Attach a 10s voice note"}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {audioBlob && !isRecording && (
                                    <Tooltip title="Remove Recording">
                                        <IconButton
                                            size="small"
                                            onClick={() => setAudioBlob(null)}
                                            sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                                        >
                                            <TrashIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Button
                                    size="small"
                                    variant={isRecording ? "contained" : "outlined"}
                                    color={isRecording ? "error" : "primary"}
                                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                                    disabled={submittingRequest || (!isRecording && audioBlob !== null)}
                                    sx={{
                                        borderRadius: '0.75rem',
                                        textTransform: 'none',
                                        fontWeight: 800,
                                        px: 2,
                                        ...(isRecording ? { bgcolor: '#ef4444' } : { borderColor: '#10B981', color: '#10B981', '&:hover': { borderColor: '#059669', bgcolor: 'rgba(16, 185, 129, 0.05)' } })
                                    }}
                                >
                                    {isRecording ? "Stop" : audioBlob ? "Recorded" : "Record"}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button
                        onClick={() => setIsRequestModalOpen(false)}
                        disabled={submittingRequest}
                        sx={{ borderRadius: '1rem', fontWeight: 800, textTransform: 'none', color: 'text.secondary', '.dark &': { color: 'slate.400' } }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitRequest}
                        disabled={submittingRequest}
                        variant="contained"
                        sx={{
                            borderRadius: '1rem',
                            fontWeight: 900,
                            textTransform: 'none',
                            px: 4,
                            bgcolor: '#10B981',
                            '&:hover': { bgcolor: '#059669' }
                        }}
                    >
                        {submittingRequest ? <CircularProgress size={20} color="inherit" /> : "Send Request"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Kudos Modal */}
            {selectedReviewee && (
                <KudosModal
                    open={isKudosModalOpen}
                    onClose={() => setIsKudosModalOpen(false)}
                    journeyId={id}
                    revieweeId={selectedReviewee.id}
                    revieweeName={selectedReviewee.name}
                    revieweeAvatar={selectedReviewee.avatar}
                    reviewerId={user?.id || ''}
                />
            )}
        </div>
    );
}
