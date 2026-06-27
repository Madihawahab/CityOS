"use client";

import { useEffect, useRef } from "react";
import type { MapMarkerData } from "@/types";
import { BENGALURU_CENTER, MAP_ZOOM } from "@/lib/utils/geo";
import { cn } from "@/lib/utils/cn";

interface MapViewProps {
  markers?: MapMarkerData[];
  center?: { latitude: number; longitude: number };
  zoom?: number;
  height?: string;
  onMarkerClick?: (reportId: string) => void;
  className?: string;
}

// Marker colors by severity
const MARKER_COLORS: Record<string, string> = {
  critical: "#ba1a1a",
  high: "#784b00",
  medium: "#004ac6",
  low: "#006c49",
};

/**
 * Leaflet map wrapper with dynamic import (no SSR).
 * Uses OpenStreetMap tiles — no API key required.
 */
export function MapView({
  markers = [],
  center = BENGALURU_CENTER,
  zoom = MAP_ZOOM.city,
  height = "400px",
  onMarkerClick,
  className,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").CircleMarker[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let map: import("leaflet").Map;

    async function initMap() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      map = L.map(mapRef.current!, {
        center: [center.latitude, center.longitude],
        zoom,
        zoomControl: true,
        attributionControl: true,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
    }

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === "undefined") return;

    async function updateMarkers() {
      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current;
      if (!map) return;

      // Remove old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add new markers
      markers.forEach((marker) => {
        const color = MARKER_COLORS[marker.severity] ?? "#004ac6";
        const circle = L.circleMarker([marker.latitude, marker.longitude], {
          radius: marker.severity === "critical" ? 10 : marker.severity === "high" ? 8 : 6,
          fillColor: color,
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        });

        circle.bindPopup(`
          <div style="padding: 8px; min-width: 180px; font-family: Inter, sans-serif;">
            <p style="font-size: 13px; font-weight: 600; margin: 0 0 4px;">${marker.title}</p>
            <p style="font-size: 11px; color: #434655; margin: 0 0 8px; text-transform: capitalize;">${marker.category.replace("_", " ")} · ${marker.severity}</p>
            <span style="font-size: 11px; background: #dbe1ff; color: #004ac6; padding: 2px 8px; border-radius: 99px;">${marker.status.replace(/_/g, " ")}</span>
          </div>
        `, { maxWidth: 200 });

        if (onMarkerClick) {
          circle.on("click", () => onMarkerClick(marker.reportId));
        }

        circle.addTo(map);
        markersRef.current.push(circle);
      });
    }

    updateMarkers();
  }, [markers, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      className={cn("rounded-2xl overflow-hidden bg-surface-container", className)}
      style={{ height }}
      role="region"
      aria-label="City map showing civic issue locations"
    />
  );
}
