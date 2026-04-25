"use client";

import Image from "next/image";
import { FormattedMessage } from "react-intl";
import {
    Show,
    SignInButton,
    SignUpButton,
    UserButton
} from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSelector } from "./LocaleSelector";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

import React, { useState } from "react";
import { Drawer, List, ListItem, ListItemText, ListItemButton, Divider, Box, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

interface HeaderProps {
    theme: "light" | "dark";
    toggleTheme: () => void;
    locale: string;
    handleLocaleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function Header({
    theme,
    toggleTheme,
    locale,
    handleLocaleChange
}: HeaderProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleMobileMenu = () => setMobileOpen(!mobileOpen);

    const navLinks = [
        { id: "nav.howItWorks", href: "#" },
        { id: "nav.safety", href: "#" }
    ];

    const mobileMenu = (
        <Box sx={{
            width: '100%',
            height: '100%',
            bgcolor: theme === 'dark' ? '#09090b' : '#ffffff',
            color: theme === 'dark' ? '#fafafa' : '#1e293b',
            p: 3
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <div className="flex items-center gap-2">
                    <Image src="/logo.png" alt="Logo" width={32} height={32} className="dark:brightness-200" />
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>Journey-mate</Typography>
                </div>
                <IconButton onClick={toggleMobileMenu} color="inherit" aria-label="Close menu">
                    <CloseIcon />
                </IconButton>
            </Box>

            <List sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
                {navLinks.map((link) => (
                    <ListItem key={link.id} disablePadding>
                        <ListItemButton
                            component="a"
                            href={link.href}
                            onClick={toggleMobileMenu}
                            sx={{ borderRadius: '1rem' }}
                        >
                            <ListItemText
                                primary={
                                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                                        <FormattedMessage id={link.id} />
                                    </Typography>
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                ))}

                <Show when="signed-in">
                    <ListItem disablePadding>
                        <ListItemButton
                            component="a"
                            href="/dashboard"
                            onClick={toggleMobileMenu}
                            sx={{ borderRadius: '1rem', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}
                        >
                            <ListItemText
                                primary={
                                    <Typography sx={{ fontWeight: 900, fontSize: '1.1rem' }}>
                                        Go to Dashboard
                                    </Typography>
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                </Show>
            </List>

            <Divider sx={{ my: 4, opacity: 0.1 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Language</Typography>
                    <LocaleSelector locale={locale} handleLocaleChange={handleLocaleChange} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Appearance</Typography>
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                </Box>
            </Box>

            <Box sx={{ mt: 'auto', pt: 6 }}>
                <Show when="signed-out">
                    <SignUpButton mode="modal">
                        <button className="w-full bg-navy dark:bg-sand dark:text-navy text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg">
                            Get Started
                        </button>
                    </SignUpButton>
                </Show>
            </Box>
        </Box>
    );

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 bg-white/80 dark:bg-deep-navy/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-white/5" aria-label="Main navigation">
            {/* Mobile Brand Link (Left) */}
            <div className="flex md:hidden items-center gap-3">
                <IconButton
                    onClick={toggleMobileMenu}
                    color="inherit"
                    aria-label="Open menu"
                    sx={{ bgcolor: 'rgba(0,0,0,0.03)', '.dark &': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                >
                    <MenuIcon />
                </IconButton>
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            fill
                            className="object-contain dark:brightness-200"
                        />
                    </div>
                </Link>
            </div>

            {/* Desktop Brand Link (Left) */}
            <Link href="/" aria-label="Journey-mate Home" className="hidden md:flex items-center gap-2 group cursor-pointer">
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
                    className="text-xl font-bold text-navy dark:text-offwhite tracking-tight"
                    style={{
                        textShadow: theme === "light"
                            ? "0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 1px 2px rgba(0,0,0,0.2)"
                            : "0 1px 0 #222, 0 2px 0 #1a1a1a, 0 3px 0 #111, 0 1px 2px rgba(0,0,0,0.5)"
                    }}
                >
                    Journey<span className="text-forest dark:text-sand/80 text-xl font-bold font-sans">-mate</span>
                    <FlightTakeoffIcon sx={{ fontSize: 22, color: 'forest.main', ml: 0.5, transform: 'rotate(5deg)' }} />
                </span>
            </Link>

            {/* Desktop Navigation (Center/Right) */}
            <div className="hidden md:flex items-center gap-8">
                <div className="flex items-center gap-6 font-medium text-navy dark:text-offwhite/80 lg:px-4">
                    <a href="#" className="hover:text-forest dark:hover:text-sand transition-colors text-sm">
                        <FormattedMessage id="nav.howItWorks" />
                    </a>
                    <a href="#" className="hover:text-forest dark:hover:text-sand transition-colors text-sm">
                        <FormattedMessage id="nav.safety" />
                    </a>
                </div>

                <div className="flex items-center gap-2">
                    <LocaleSelector locale={locale} handleLocaleChange={handleLocaleChange} />
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

                    <Show when="signed-out">
                        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                            <button className="hover:text-forest dark:hover:text-sand transition-colors text-sm font-medium cursor-pointer mx-2">
                                <FormattedMessage id="nav.logIn" />
                            </button>
                        </SignInButton>
                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                            <button className="bg-navy dark:bg-sand dark:text-navy text-white px-6 py-2 rounded-full font-bold hover:bg-forest dark:hover:bg-white transition-all text-sm shadow-sm">
                                <FormattedMessage id="nav.signUp" />
                            </button>
                        </SignUpButton>
                    </Show>
                    <Show when="signed-in">
                        <a href="/dashboard" className="hover:text-forest dark:hover:text-sand transition-colors text-sm font-medium mx-2">
                            Dashboard
                        </a>
                        <UserButton />
                    </Show>
                </div>
            </div>

            {/* Mobile User Profile (Right) */}
            <div className="flex md:hidden items-center gap-3">
                <Show when="signed-in">
                    <UserButton />
                </Show>
                <Show when="signed-out">
                    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                        <button className="text-xs font-black uppercase tracking-widest text-navy dark:text-offwhite bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                            Log In
                        </button>
                    </SignInButton>
                </Show>
            </div>

            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={toggleMobileMenu}
                transitionDuration={400}
                slotProps={{
                    paper: {
                        sx: { width: '85%', maxWidth: '320px' }
                    }
                }}
            >
                {mobileMenu}
            </Drawer>
        </nav>
    );
}
