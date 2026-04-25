"use client";

import React, { useState, useEffect } from "react";
import { IntlProvider, FormattedMessage } from "react-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { messages } from "../../i18n/messages";
import { ThemeToggle } from "../../components/ThemeToggle";
import { LocaleSelector } from "../../components/LocaleSelector";
import { UserButton, Show } from "@clerk/nextjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { JourneysProvider } from "../../context/JourneysContext";
import { RoleProvider } from "../../context/RoleContext";
import { MessagesProvider, useMessages } from "../../context/MessagesContext";
import { CallingProvider } from "../../context/CallingContext";
import { CallOverlay } from "./components/CallOverlay";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import {
    Badge,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Typography as MuiTypography,
    Box as MuiBox
} from "@mui/material";
import {
    Notifications as NotificationsIcon,
    ChatBubbleOutlined as MessageIcon,
    PersonAddOutlined as RequestIcon,
    InfoOutlined as InfoIcon
} from "@mui/icons-material";

type Locale = keyof typeof messages;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [locale, setLocale] = useState<Locale>("en");
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        const savedLocale = localStorage.getItem("locale") as Locale | null;
        if (savedTheme) {
            setTheme(savedTheme);
            if (savedTheme === "dark") document.documentElement.classList.add("dark");
        }
        if (savedLocale) setLocale(savedLocale);
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === "light" ? "dark" : "light";
        setTheme(nextTheme);
        localStorage.setItem("theme", nextTheme);
        document.documentElement.classList.toggle("dark");
    };

    const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value as Locale;
        setLocale(nextLocale);
        localStorage.setItem("locale", nextLocale);
    };

    return (
        <IntlProvider messages={messages[locale]} locale={locale} defaultLocale="en">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <RoleProvider>
                    <MessagesProvider>
                        <CallingProvider>
                            <JourneysProvider>
                                <div className="min-h-screen bg-offwhite dark:bg-navy font-sans transition-colors duration-300">
                                    <CallOverlay />
                                    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 lg:px-6 py-3.5 bg-white/80 dark:bg-navy/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 shadow-sm">
                                        <div className="flex items-center gap-8">
                                            <Link href="/" className="flex items-center gap-2 group cursor-pointer text-decoration-none">
                                                <div className="relative w-10 h-10 overflow-hidden rounded-lg transition-transform group-hover:scale-105">
                                                    <Image
                                                        src="/logo.png"
                                                        alt="Journey-mate Logo"
                                                        fill
                                                        sizes="40px"
                                                        className="object-contain dark:brightness-200 dark:contrast-150"
                                                    />
                                                </div>
                                                <span
                                                    className="text-xl font-bold text-navy dark:text-offwhite tracking-tight flex items-center gap-1.5"
                                                    style={{
                                                        textShadow: theme === "light"
                                                            ? "0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 1px 2px rgba(0,0,0,0.2)"
                                                            : "0 1px 0 #222, 0 2px 0 #1a1a1a, 0 3px 0 #111, 0 1px 2px rgba(0,0,0,0.5)"
                                                    }}
                                                >
                                                    Journey<span className="text-forest dark:text-sand/80 font-bold">-mate</span>
                                                    <FlightTakeoffIcon sx={{ fontSize: 22, color: 'forest.main', ml: 0.5, transform: 'rotate(5deg)' }} />
                                                </span>
                                            </Link>
                                        </div>

                                        <div className="flex items-center gap-3 lg:gap-4">
                                            <Link
                                                href="/dashboard/post"
                                                className="bg-navy dark:bg-sand text-white dark:text-navy px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-forest transition-all shadow-md active:scale-95 text-decoration-none"
                                            >
                                                Post a Journey
                                            </Link>

                                            <Show when="signed-in">
                                                <NotificationBell />
                                            </Show>

                                            <div className="flex items-center gap-2 lg:gap-3 border-l border-gray-100 dark:border-white/10 pl-3 lg:pl-4">
                                                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                                                <LocaleSelector locale={locale} handleLocaleChange={handleLocaleChange} />
                                                <Show when="signed-in">
                                                    <UserButton />
                                                </Show>
                                            </div>
                                        </div>
                                    </nav>

                                    <main>
                                        {children}
                                    </main>
                                </div>
                            </JourneysProvider>
                        </CallingProvider>
                    </MessagesProvider>
                </RoleProvider>
            </LocalizationProvider>
        </IntlProvider>
    );
}

function NotificationBell() {
    const { notifications, unreadCount, markAsRead } = useMessages();
    const router = useRouter();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = (notif: any) => {
        markAsRead(notif.id);
        handleClose();
        router.push(`/dashboard/journey/${notif.journeyId}`);
    };

    return (
        <>
            <IconButton
                onClick={handleClick}
                sx={{
                    color: 'navy.main',
                    bgcolor: 'gray.50',
                    '&:hover': { bgcolor: 'gray.100' },
                    width: 44,
                    height: 44,
                    borderRadius: '12px'
                }}
                className="dark:text-offwhite dark:bg-white/5 dark:hover:bg-white/10"
            >
                <Badge badgeContent={unreadCount} color="error" overlap="circular">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                    paper: {
                        sx: {
                            mt: 1.5,
                            width: 320,
                            maxHeight: 400,
                            borderRadius: '1.5rem',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(0,0,0,0.05)',
                            overflow: 'hidden'
                        }
                    }
                }}
            >
                <MuiBox sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <MuiTypography variant="subtitle2" sx={{ fontWeight: 900, color: 'navy.main', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Notifications
                    </MuiTypography>
                </MuiBox>

                {notifications.length === 0 ? (
                    <MuiBox sx={{ py: 6, textAlign: 'center', opacity: 0.5 }}>
                        <InfoIcon sx={{ fontSize: 32, mb: 1, opacity: 0.3 }} />
                        <MuiTypography variant="body2" sx={{ fontWeight: 600 }}>All caught up!</MuiTypography>
                    </MuiBox>
                ) : (
                    notifications.map((notif) => (
                        <MenuItem
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            sx={{
                                py: 2,
                                px: 2.5,
                                gap: 2,
                                borderBottom: '1px solid rgba(0,0,0,0.03)',
                                bgcolor: notif.read ? 'transparent' : 'rgba(14, 165, 233, 0.03)',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 'auto' }}>
                                <MuiBox sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: notif.type === 'message' ? 'rgba(14, 165, 233, 0.1)' : notif.type === 'request' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                    color: notif.type === 'message' ? '#0ea5e9' : notif.type === 'request' ? '#22c55e' : '#f59e0b'
                                }}>
                                    {notif.type === 'message' ? <MessageIcon fontSize="small" /> : notif.type === 'request' ? <RequestIcon fontSize="small" /> : <InfoIcon fontSize="small" />}
                                </MuiBox>
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <MuiTypography variant="caption" sx={{ fontWeight: 900, display: 'block', mb: 0.2, color: 'navy.main' }}>
                                        {notif.title}
                                    </MuiTypography>
                                }
                                secondary={
                                    <MuiTypography variant="caption" sx={{ fontSize: '11px', fontWeight: 600, color: 'text.secondary', lineHeight: 1.2 }}>
                                        {notif.message}
                                    </MuiTypography>
                                }
                            />
                            {!notif.read && (
                                <MuiBox sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0ea5e9', flexShrink: 0 }} />
                            )}
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
}
