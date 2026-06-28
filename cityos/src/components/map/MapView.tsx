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
  showPipelines?: boolean;
  showPowerGrid?: boolean;
  showDrainageGrid?: boolean;
  showHospitals?: boolean;
  showSchools?: boolean;
  showRoadMaintenance?: boolean;
  showRiskZones?: boolean;
  showDepartments?: boolean;
  timelineIndex?: number;
}

export function MapView({
  markers = [],
  center = BENGALURU_CENTER,
  zoom = MAP_ZOOM.city,
  height = "400px",
  onMarkerClick,
  className,
  showPipelines = false,
  showPowerGrid = false,
  showDrainageGrid = false,
  showHospitals = false,
  showSchools = false,
  showRoadMaintenance = false,
  showRiskZones = false,
  showDepartments = true,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").Layer[]>([]);
  const overlaysRef = useRef<import("leaflet").Layer[]>([]);

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

  // Recenter map dynamically when coordinates change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && center) {
      map.setView([center.latitude, center.longitude], zoom, { animate: true });
    }
  }, [center, zoom]);

  // Update markers, overlays, and grids when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === "undefined") return;

    async function updateMapLayers() {
      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current;
      if (!map) return;

      // 1. Remove old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // 2. Remove old overlays
      overlaysRef.current.forEach((o) => o.remove());
      overlaysRef.current = [];

      const currentZoom = map.getZoom();
      
      // Category icon dictionary
      const iconMap: Record<string, string> = {
        water: "water_drop",
        roads: "edit_road",
        sanitation: "delete",
        garbage: "delete",
        electricity: "electric_bolt",
        drainage: "tsunami",
        public_works: "engineering",
        parks: "yard",
        other: "warning"
      };

      // Custom marker clustering algorithm
      // Group nearby markers if zoom is low (e.g. less than 15)
      const useClustering = currentZoom < 15;
      const threshold = 0.015 / Math.pow(2, currentZoom - 12);
      
      interface Cluster {
        center: [number, number];
        markers: MapMarkerData[];
      }
      const clusters: Cluster[] = [];

      markers.forEach((marker) => {
        if (!useClustering) {
          clusters.push({
            center: [marker.latitude, marker.longitude],
            markers: [marker]
          });
          return;
        }

        let placed = false;
        for (const cluster of clusters) {
          const latDiff = Math.abs(cluster.center[0] - marker.latitude);
          const lngDiff = Math.abs(cluster.center[1] - marker.longitude);
          if (latDiff < threshold && lngDiff < threshold) {
            cluster.markers.push(marker);
            placed = true;
            break;
          }
        }
        if (!placed) {
          clusters.push({
            center: [marker.latitude, marker.longitude],
            markers: [marker]
          });
        }
      });

      // Render clusters or single markers
      clusters.forEach((cluster) => {
        if (cluster.markers.length > 1) {
          // Render Cluster Bubble
          const clusterIcon = L.divIcon({
            html: `
              <div class="flex items-center justify-center rounded-full bg-blue-600 border-2 border-white text-white text-xs font-black shadow-lg" style="width: 32px; height: 32px; box-shadow: 0 4px 10px rgba(0,0,0,0.4);">
                ${cluster.markers.length}
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            className: "custom-cluster-icon"
          });

          const clusterMarker = L.marker(cluster.center, { icon: clusterIcon });
          clusterMarker.on("click", () => {
            map.setView(cluster.center, map.getZoom() + 2, { animate: true });
          });
          clusterMarker.addTo(map);
          markersRef.current.push(clusterMarker);
        } else {
          // Render Single Marker
          const marker = cluster.markers[0]!;
          let color = "#2196f3"; // default blue (Resolved)
          const isPredicted = (marker.status as string) === "predicted" || marker.reportId.startsWith("PRED-");
          
          if (marker.status === "citizen_verification_pending") {
            color = "#a855f7"; // Purple: Waiting Verification
          } else if (marker.status === "resolved" || marker.status === "closed") {
            color = "#3b82f6"; // Blue: Resolved
          } else if (isPredicted) {
            color = "#06b6d4"; // Glowing Cyan: Predicted
          } else {
            // Severity color mapping
            if (marker.severity === "critical") color = "#ef4444"; // Red
            else if (marker.severity === "high") color = "#f97316"; // Orange
            else if (marker.severity === "medium") color = "#eab308"; // Yellow
            else if (marker.severity === "low") color = "#22c55e"; // Green
          }

          // Dynamic Trending / Support pulse animation
          const pulseClass = isPredicted 
            ? "animate-pulse border-cyan-400" 
            : (marker.severity === "critical" ? "animate-pulse" : "");

          const markerIcon = L.divIcon({
            html: `
              <div class="flex items-center justify-center rounded-full bg-slate-900 border-2 border-white text-white shadow-lg ${pulseClass}" style="width: 32px; height: 32px; border-color: ${color}; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                <span class="material-symbols-outlined text-[16px]" style="color: ${color}; font-weight: bold;">
                  ${iconMap[marker.category] || "warning"}
                </span>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            className: "custom-category-marker"
          });

          const mapMarker = L.marker([marker.latitude, marker.longitude], { icon: markerIcon });
          
          if (onMarkerClick) {
            mapMarker.on("click", () => onMarkerClick(marker.reportId));
          }

          // If predicted issue, draw a translucent glowing impact circle
          if (isPredicted) {
            const predCircle = L.circle([marker.latitude, marker.longitude], {
              radius: 120, // impact radius
              color: "#06b6d4",
              fillColor: "#06b6d4",
              fillOpacity: 0.25,
              weight: 1.5,
              dashArray: "4, 8"
            }).addTo(map);
            overlaysRef.current.push(predCircle);
          }

          mapMarker.addTo(map);
          markersRef.current.push(mapMarker);
        }
      });

      // 3. Render Digital Twin Pipelines
      if (showPipelines) {
        const pipeline = L.polyline(
          [
            [12.9352, 77.6245],
            [12.9365, 77.6258],
            [12.9385, 77.6288],
            [12.9405, 77.6318],
          ],
          { color: "#3b82f6", weight: 4, dashArray: "6, 12", opacity: 0.8 }
        );
        pipeline.addTo(map);
        overlaysRef.current.push(pipeline);
      }

      // Digital Twin Power Grid
      if (showPowerGrid) {
        const grid = L.polyline(
          [
            [12.9332, 77.6225],
            [12.9348, 77.6238],
            [12.9372, 77.6212],
            [12.9392, 77.6192],
          ],
          { color: "#eab308", weight: 4, dashArray: "6, 12", opacity: 0.8 }
        );
        grid.addTo(map);
        overlaysRef.current.push(grid);
      }

      // Digital Twin Drainage Grid
      if (showDrainageGrid) {
        const drainage = L.polyline(
          [
            [12.9382, 77.6275],
            [12.9362, 77.6255],
            [12.9341, 77.6215],
          ],
          { color: "#a855f7", weight: 4, dashArray: "6, 12", opacity: 0.8 }
        );
        drainage.addTo(map);
        overlaysRef.current.push(drainage);
      }

      // Hospitals Halos (Light blue glow)
      if (showHospitals) {
        const hospCoord: [number, number] = [12.9335, 77.6205];
        const hospMarker = L.circleMarker(hospCoord, {
          radius: 12,
          fillColor: "#ef4444",
          color: "#fff",
          weight: 2,
          fillOpacity: 0.9
        }).addTo(map);
        
        const hospHalo = L.circle(hospCoord, {
          radius: 350, // 350m radius
          color: "#60a5fa",
          fillColor: "#60a5fa",
          fillOpacity: 0.12,
          weight: 1
        }).addTo(map);

        hospMarker.bindPopup("🏥 St. John's Hospital (Emergency Route Hub)");
        overlaysRef.current.push(hospMarker);
        overlaysRef.current.push(hospHalo);
      }

      // Schools Halos (Light green glow)
      if (showSchools) {
        const schoolCoord: [number, number] = [12.9378, 77.6272];
        const schoolMarker = L.circleMarker(schoolCoord, {
          radius: 12,
          fillColor: "#10b981",
          color: "#fff",
          weight: 2,
          fillOpacity: 0.9
        }).addTo(map);

        const schoolHalo = L.circle(schoolCoord, {
          radius: 200, // 200m safety zone
          color: "#34d399",
          fillColor: "#34d399",
          fillOpacity: 0.1,
          weight: 1
        }).addTo(map);

        schoolMarker.bindPopup("🏫 Koramangala Primary School Corridor");
        overlaysRef.current.push(schoolMarker);
        overlaysRef.current.push(schoolHalo);
      }

      // Road maintenance zones (Orange overlay)
      if (showRoadMaintenance) {
        const maintenanceZone = L.polygon(
          [
            [12.9312, 77.6205],
            [12.9328, 77.6225],
            [12.9308, 77.6245],
            [12.9292, 77.6225],
          ],
          {
            color: "#f97316",
            fillColor: "#f97316",
            fillOpacity: 0.3,
            weight: 2
          }
        ).addTo(map);
        maintenanceZone.bindPopup("🚧 Active Road Re-tarring Zone: Delay expected");
        overlaysRef.current.push(maintenanceZone);
      }

      // 4. Render Dynamic AI Risk Zones (Translucent polygons)
      if (showRiskZones) {
        // High Risk Zone
        const highRiskZone = L.polygon(
          [
            [12.9362, 77.6235],
            [12.9392, 77.6255],
            [12.9372, 77.6275],
          ],
          {
            color: "#f97316",
            fillColor: "#f97316",
            fillOpacity: 0.25,
            weight: 1.5
          }
        ).addTo(map);

        highRiskZone.bindPopup(`
          <div style="padding: 6px; font-family: Inter, sans-serif; font-size: 11px;">
            <strong style="color: #f97316; font-size: 12px;">📊 High Risk Drainage Zone</strong>
            <p style="margin: 4px 0 0;">Probability: 87%</p>
            <p style="margin: 2px 0 0;">Engine: Civic Intelligence</p>
            <p style="margin: 2px 0 0;">Reason: Water pipeline burst + monsoon forecasting</p>
          </div>
        `);
        overlaysRef.current.push(highRiskZone);
      }

      // 5. Render Department Presences
      if (showDepartments) {
        const depts = [
          { name: "💧 Water Works Headquarters", coord: [12.9398, 77.6235], workload: "Normal", open: 8, time: "4.2 Hours" },
          { name: "⚡ BESCOM Electrical Center", coord: [12.9318, 77.6285], workload: "High", open: 14, time: "5.8 Hours" }
        ];

        depts.forEach((dept) => {
          const deptIcon = L.divIcon({
            html: `
              <div class="flex items-center justify-center rounded-lg bg-blue-900 border border-blue-400 text-white shadow-md hover:scale-105 transition-transform" style="width: 28px; height: 28px;">
                <span class="material-symbols-outlined text-[16px] text-blue-400">corporate_fare</span>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            className: "dept-presence-icon"
          });

          const deptMarker = L.marker(dept.coord as [number, number], { icon: deptIcon }).addTo(map);
          deptMarker.bindTooltip(`
            <div style="font-family: Inter, sans-serif; font-size: 10px; padding: 4px;">
              <strong>${dept.name}</strong><br/>
              • Workload: ${dept.workload}<br/>
              • Open Issues: ${dept.open}<br/>
              • Avg Resolution Time: ${dept.time}
            </div>
          `);
          overlaysRef.current.push(deptMarker);
        });
      }
    }

    updateMapLayers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, showPipelines, showPowerGrid, showDrainageGrid, showHospitals, showSchools, showRoadMaintenance, showRiskZones, showDepartments]);

  return (
    <div
      ref={mapRef}
      className={cn("rounded-2xl overflow-hidden bg-slate-900 border border-slate-800", className)}
      style={{ height }}
      role="region"
      aria-label="City map showing civic issue locations"
    />
  );
}
