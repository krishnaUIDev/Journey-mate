"use client";

import React, { useMemo, useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Tooltip,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Box, Typography, Avatar } from "@mui/material";
import dayjs from "dayjs";

interface SquadLocation {
    userId: string;
    userName: string;
    lat: number;
    lng: number;
    updatedAt: string;
}

interface MeetupMapProps {
    locations: Record<string, SquadLocation>;
    center?: [number, number];
    zoom?: number;
}

// Custom Leaflet icon for travelers
const createTravelerIcon = (name: string) => L.divIcon({
    className: 'meetup-traveler-icon',
    html: `<div class="marker-container">
            <div class="marker-avatar">${name?.[0] || 'T'}</div>
            <div class="marker-pulse"></div>
         </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

function SetViewBounds({ locations }: { locations: Record<string, SquadLocation> }) {
    const map = useMap();
    const locArray = Object.values(locations);

    useEffect(() => {
        if (locArray.length > 0 && map) {
            const validPoints = locArray.filter(l => l.lat != null && l.lng != null);
            if (validPoints.length === 0) return;

            const bounds = L.latLngBounds(validPoints.map(l => [l.lat, l.lng]));
            try {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18, animate: true });
            } catch (e) {
                console.warn("Leaflet fitBounds failed:", e);
            }
        }
    }, [locArray, map]);

    return null;
}

export default function MeetupMap({
    locations,
    center = [0, 0],
    zoom = 15,
}: MeetupMapProps) {
    const locArray = Object.values(locations);

    // Default center based on first location if available
    const mapCenter: [number, number] = useMemo(() => {
        if (locArray.length > 0) {
            const first = locArray[0];
            if (first && first.lat != null && first.lng != null) {
                return [first.lat, first.lng];
            }
        }
        return center;
    }, [locArray, center]);

    return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative', borderRadius: '1rem', overflow: 'hidden' }}>
            <style jsx global>{`
        .marker-container {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
        }
        .marker-avatar {
            width: 32px;
            height: 32px;
            background: #10B981;
            color: white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 2;
        }
        .marker-pulse {
            position: absolute;
            width: 40px;
            height: 40px;
            background: rgba(16, 185, 129, 0.4);
            border-radius: 50%;
            z-index: 1;
            animation: pulse 2s infinite ease-out;
        }
        @keyframes pulse {
            0% { transform: scale(0.5); opacity: 0.8; }
            100% { transform: scale(1.5); opacity: 0; }
        }
        .leaflet-container {
            background: #f1f5f9 !important;
            border-radius: 1rem;
        }
        .custom-tooltip-name {
            background: rgba(15, 23, 42, 0.9) !important;
            border: none !important;
            border-radius: 6px !important;
            padding: 4px 8px !important;
            color: white !important;
            font-weight: 900 !important;
            font-size: 10px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
        }
        .custom-tooltip-name::before {
            border-top-color: rgba(15, 23, 42, 0.9) !important;
        }
      `}</style>

            <MapContainer
                center={mapCenter}
                zoom={zoom}
                scrollWheelZoom={true}
                className="h-full w-full"
                style={{ height: '100%' }}
                attributionControl={false}
            >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png" />

                {locArray.map((loc) => (
                    <Marker
                        key={loc.userId}
                        position={[loc.lat, loc.lng]}
                        icon={createTravelerIcon(loc.userName)}
                    >
                        <Tooltip
                            permanent
                            direction="top"
                            offset={[0, -20]}
                            className="custom-tooltip-name"
                        >
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '9px', display: 'block' }}>{loc.userName.split(' ')[0]}</Typography>
                                <Typography variant="caption" sx={{ fontSize: '7px', opacity: 0.7 }}>{dayjs(loc.updatedAt).fromNow()}</Typography>
                            </Box>
                        </Tooltip>
                        <Popup>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{loc.userName}</Typography>
                            <Typography variant="caption">Last updated: {dayjs(loc.updatedAt).format('h:mm:ss A')}</Typography>
                        </Popup>
                    </Marker>
                ))}

                <SetViewBounds locations={locations} />
            </MapContainer>
        </Box>
    );
}
