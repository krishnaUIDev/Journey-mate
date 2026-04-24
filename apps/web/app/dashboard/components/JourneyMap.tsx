"use client";

import React, { useMemo, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Tooltip,
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
    type?: 'origin' | 'destination';
  }>;
  route?: [number, number][];
  isAnimated?: boolean;
}

// Custom icons for Origin and Destination
const createOriginIcon = () => L.divIcon({
  className: 'custom-origin-icon',
  html: `<div class="origin-dot-outer"><div class="origin-dot-inner"></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const createDestinationIcon = () => L.divIcon({
  className: 'custom-destination-icon',
  html: `<div class="destination-pin">
            <div class="pin-head">
              <svg viewBox="0 0 24 24" fill="white" class="w-3 h-3"><path d="M21 16.5L21 15L13 10V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V10L2 15V16.5L10 14V19L8 20.5V22L11.5 21L15 22V20.5L13 19V14L21 16.5Z"/></svg>
            </div>
            <div class="pin-tip"></div>
          </div>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
});

// Helper component to auto-fit bounds safely with responsive padding
function SetViewBounds({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && map) {
      // Detect if we are on desktop (lg) to apply sidebar padding
      const isDesktop = window.innerWidth >= 1024;
      const paddingRight = isDesktop ? 520 : 50; // Sidebar is 480px
      const paddingLeft = 50;
      const paddingTop = 100;
      const paddingBottom = 50;

      try {
        map.fitBounds(bounds, {
          paddingTopLeft: [paddingLeft, paddingTop],
          paddingBottomRight: [paddingRight, paddingBottom],
          animate: true,
          duration: 1.5
        });
      } catch (e) {
        console.warn("Leaflet fitBounds failed, likely map not ready:", e);
      }

      // Ensure map size is correct after sidebar transitions
      const timer = setTimeout(() => {
        if (map) {
          try {
            map.invalidateSize();
          } catch (e) {
            console.warn("Leaflet invalidateSize failed:", e);
          }
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [bounds, map]);

  return null;
}

/**
 * Calculates a Great Circle path between two points using spherical interpolation (Slerp).
 */
function getGeodesicPoints(
  start: [number, number],
  end: [number, number],
  steps: number = 80
) {
  const points: [number, number][] = [];
  const rad = Math.PI / 180;

  const lat1 = start[0] * rad;
  const lon1 = start[1] * rad;
  const lat2 = end[0] * rad;
  const lon2 = end[1] * rad;

  // Calculate angular distance between points
  const d = 2 * Math.asin(Math.sqrt(
    Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon1 - lon2) / 2), 2)
  ));

  // Handle same point case
  if (d === 0) return [start];

  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);

    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);

    const lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
    const lon = Math.atan2(y, x);

    points.push([lat / rad, lon / rad]);
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
    return getGeodesicPoints(start, end);
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

        /* Custom Tooltip Styling */
        .leaflet-tooltip.custom-tooltip {
          background-color: white;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 8px;
          padding: 4px 10px;
          font-weight: 800;
          font-size: 11px;
          color: #1e293b;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .leaflet-tooltip-top.custom-tooltip::before {
          border-top-color: white;
        }

        /* Custom Marker Icons */
        .origin-dot-outer {
          width: 20px;
          height: 20px;
          background: rgba(14, 165, 233, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(14, 165, 233, 0.3);
        }
        .origin-dot-inner {
          width: 8px;
          height: 8px;
          background: #0ea5e9;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(14, 165, 233, 0.5);
        }

        .destination-pin {
          display: flex;
          flex-direction: column;
          align-items: center;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));
        }
        .pin-head {
          width: 30px;
          height: 30px;
          background: #0ea5e9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }
        .pin-tip {
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 12px solid #0ea5e9;
          margin-top: -2px;
        }

        .custom-tooltip.origin {
          color: #0369a1;
          border-left: 3px solid #0ea5e9;
        }
        .custom-tooltip.destination {
          color: #0c4a6e;
          border-left: 3px solid #0369a1;
          font-weight: 900;
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

        {markers.map((marker, index) => {
          // Extract city name (shorter version of the label)
          const cityName = marker.label.split(' (')[0] || marker.label;
          const icon = marker.type === 'origin' ? createOriginIcon() : createDestinationIcon();

          return (
            <Marker key={index} position={marker.position} icon={icon}>
              <Tooltip
                permanent
                direction="top"
                offset={marker.type === 'origin' ? [0, -10] : [0, -40]}
                opacity={1}
                className={`custom-tooltip ${marker.type || 'destination'}`}
              >
                <span className="flex flex-col items-center">
                  <span className="text-[7px] opacity-50 font-black tracking-widest leading-none mb-0.5">
                    {marker.type === 'origin' ? 'FROM' : 'TO'}
                  </span>
                  {cityName}
                </span>
              </Tooltip>
              <Popup>{marker.label}</Popup>
            </Marker>
          );
        })}

        <SetViewBounds bounds={bounds} />
      </MapContainer>
    </div>
  );
}