"use client";

import React, { useMemo, useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Next.js
const customIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface JourneyMapProps {
    center?: [number, number];
    zoom?: number;
    markers?: Array<{
        position: [number, number];
        label: string;
    }>;
    route?: [number, number][];
    isAnimated?: boolean;
}

// Helper component to auto-fit bounds safely
function SetViewBounds({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
    const map = useMap();

    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [100, 100] });
        }
    }, [bounds, map]);

    return null;
}

/**
 * Calculates intermediate points for a Bezier curve between two coordinates.
 */
function getBezierPoints(
    start: [number, number],
    end: [number, number],
    steps: number = 100
) {
    const points: [number, number][] = [];

    const midLat = (start[0] + end[0]) / 2;
    const midLng = (start[1] + end[1]) / 2;

    const latDiff = end[0] - start[0];
    const lngDiff = end[1] - start[1];
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

    const offsetX = -lngDiff * (0.2 + distance * 0.05);
    const offsetY = latDiff * (0.2 + distance * 0.05);

    const cp: [number, number] = [midLat + offsetY, midLng + offsetX];

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const lat =
            (1 - t) * (1 - t) * start[0] +
            2 * (1 - t) * t * cp[0] +
            t * t * end[0];
        const lng =
            (1 - t) * (1 - t) * start[1] +
            2 * (1 - t) * t * cp[1] +
            t * t * end[1];

        points.push([lat, lng]);
    }

    return points;
}

export default function JourneyMap({
    center = [20, 0],
    zoom = 2,
    markers = [],
    route = [],
    isAnimated = true,
}: JourneyMapProps) {
    const curvePoints = useMemo(() => {
        if (!route || route.length < 2) return [];
        const start = route[0];
        const end = route[1];
        if (!start || !end) return [];
        return getBezierPoints(start, end);
    }, [route]);

    const bounds = useMemo(() => {
        if (!markers || markers.length === 0) return null;
        const validMarkers = markers.filter((m) => Array.isArray(m.position));
        if (validMarkers.length === 0) return null;
        return L.latLngBounds(validMarkers.map((m) => m.position));
    }, [markers]);

    return (
        <div className="relative h-full w-full z-0">
            <style jsx global>{`
        @keyframes linePulse {
          from {
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        .animated-route {
          stroke-dasharray: 10, 5;
          animation: linePulse 30s linear infinite;
        }

        .leaflet-container {
          position: relative;
          height: 100%;
          width: 100%;
          background: #f8fafc !important;
        }

        /* Light color overlay above tiles */
        .leaflet-container::after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(248, 250, 252, 0.28);
          pointer-events: none;
          z-index: 400;
        }

        /* Keep map panes and controls above base layers correctly */
        .leaflet-pane,
        .leaflet-top,
        .leaflet-bottom,
        .leaflet-control {
          position: relative;
        }

        /* Slight visual tuning of the tile layer */
        .leaflet-tile-pane {
          filter: brightness(1.08) saturate(0.95);
        }
      `}</style>

            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                dragging={true}
                zoomControl={false}
                attributionControl={false}
                className="h-full w-full"
            >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png" />

                {curvePoints.length > 0 && (
                    <Polyline
                        positions={curvePoints}
                        pathOptions={{
                            color: "#0369a1",
                            weight: 3,
                            opacity: 0.9,
                            className: isAnimated ? "animated-route" : "",
                        }}
                    />
                )}

                {markers.map((marker, index) => (
                    <Marker key={index} position={marker.position} icon={customIcon}>
                        <Popup>{marker.label}</Popup>
                    </Marker>
                ))}

                <SetViewBounds bounds={bounds} />
            </MapContainer>
        </div>
    );
}