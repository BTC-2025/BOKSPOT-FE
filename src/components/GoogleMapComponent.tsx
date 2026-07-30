'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useUIStore } from '../lib/store';

interface MarkerData {
  id: string;
  name: string;
  merchant: string;
  lat: number;
  lng: number;
  emoji: string;
  category: string;
  price: string | number;
  rating: number;
  linkUrl?: string;
}

interface GoogleMapComponentProps {
  center: [number, number];
  zoom?: number;
  markers: MarkerData[];
  onMarkerClick?: (marker: MarkerData) => void;
  selectedMarkerId?: string | null;
}

// Custom dark mode style for Google Maps
const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1e1b4b' }] }, // deep indigo-950 base
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#818cf8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#c084fc' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#c084fc' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#111827' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4b5563' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#312e81' }], // indigo road bed
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e1b4b' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#4338ca' }], // bright highway
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#312e81' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e2e8f0' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1f2937' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#a78bfa' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#475569' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#0f172a' }],
  },
];

export default function GoogleMapComponent({
  center,
  zoom = 13,
  markers,
  onMarkerClick,
  selectedMarkerId,
}: GoogleMapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const infoWindowRef = useRef<any>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const { theme } = useUIStore();

  const activeTheme = useMemo(() => {
    if (theme === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      }
      return 'dark';
    }
    return theme || 'dark';
  }, [theme]);

  // Load Google Maps Script
  useEffect(() => {
    const scriptId = 'google-maps-sdk';
    if ((window as any).google && (window as any).google.maps) {
      setSdkLoaded(true);
      return;
    }

    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      // Using public bootstrapper script. API key is omitted to default to standard sandbox console
      script.src = 'https://maps.googleapis.com/maps/api/js?v=weekly';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const handleScriptLoad = () => setSdkLoaded(true);
    script.addEventListener('load', handleScriptLoad);

    return () => {
      script.removeEventListener('load', handleScriptLoad);
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!sdkLoaded || !mapContainerRef.current || mapRef.current) return;

    const google = (window as any).google;
    const initialMap = new google.maps.Map(mapContainerRef.current, {
      center: { lat: center[0], lng: center[1] },
      zoom: zoom,
      styles: activeTheme === 'dark' ? DARK_MAP_STYLES : [],
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
    });

    infoWindowRef.current = new google.maps.InfoWindow();
    mapRef.current = initialMap;
  }, [sdkLoaded]);

  // Handle Theme Style Changes dynamically
  useEffect(() => {
    if (mapRef.current && sdkLoaded) {
      mapRef.current.setOptions({
        styles: activeTheme === 'dark' ? DARK_MAP_STYLES : [],
      });
    }
  }, [activeTheme, sdkLoaded]);

  // Update center position
  useEffect(() => {
    if (mapRef.current && sdkLoaded) {
      mapRef.current.panTo({ lat: center[0], lng: center[1] });
    }
  }, [center[0], center[1], sdkLoaded]);

  // Sync Markers
  useEffect(() => {
    if (!mapRef.current || !sdkLoaded) return;

    const google = (window as any).google;

    // Clear old markers
    Object.values(markersRef.current).forEach((markerObj) => {
      markerObj.setMap(null);
    });
    markersRef.current = {};

    const bounds = new google.maps.LatLngBounds();
    let hasValidBounds = false;

    markers.forEach((markerData) => {
      if (!markerData.lat || !markerData.lng) return;

      const isSelected = selectedMarkerId === markerData.id;

      // Draw custom circle icon via SVG Data URL, label goes inside
      const svgColor = isSelected ? '%23f59e0b' : '%236366f1'; // amber or indigo
      const markerIcon = {
        url: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="%230b0f19" stroke="${svgColor}" stroke-width="2.5"/></svg>`,
        size: new google.maps.Size(40, 40),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20, 20),
        labelOrigin: new google.maps.Point(20, 20),
      };

      const mapMarker = new google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: mapRef.current,
        title: markerData.name,
        icon: markerIcon,
        label: {
          text: markerData.emoji || '📍',
          fontSize: '16px',
        },
      });

      // Add bounce animations for selected pins
      if (isSelected) {
        mapMarker.setAnimation(google.maps.Animation.BOUNCE);
        // Pan map center directly to selected marker
        mapRef.current.panTo({ lat: markerData.lat, lng: markerData.lng });
      }

      // Styled Google Popup InfoWindow HTML
      const popupHtml = `
        <div class="google-map-popup p-3 font-sans min-w-[200px] text-slate-100 bg-slate-950 rounded-xl" style="font-family: inherit;">
          <span style="font-size: 9px; font-weight: 800; color: %23818cf8; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 2px;">
            ${markerData.category}
          </span>
          <h4 style="font-size: 13px; font-weight: 800; color: white; margin: 0 0 2px 0; line-height: 1.2;">
            ${markerData.name}
          </h4>
          <p style="font-size: 10px; color: %2394a3b8; margin: 0 0 8px 0;">
            ${markerData.merchant}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 6px; font-size: 11px;">
            <span style="font-weight: 700; color: %23f59e0b;">⭐ ${markerData.rating}</span>
            <span style="font-weight: 900; color: %23a78bfa;">${markerData.price}</span>
          </div>
          ${
            markerData.linkUrl
              ? `<a href="${markerData.linkUrl}" style="display: block; margin-top: 8px; text-align: center; background: %234f46e5; color: white; font-size: 9px; font-weight: bold; text-transform: uppercase; text-decoration: none; padding: 6px 12px; border-radius: 6px;">Book Slot</a>`
              : ''
          }
        </div>
      `;

      mapMarker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(popupHtml);
          infoWindowRef.current.open(mapRef.current, mapMarker);
        }
        if (onMarkerClick) {
          onMarkerClick(markerData);
        }
      });

      markersRef.current[markerData.id] = mapMarker;
      bounds.extend({ lat: markerData.lat, lng: markerData.lng });
      hasValidBounds = true;
    });

    // Auto zoom fit if multiple pins exist
    if (markers.length > 1 && hasValidBounds) {
      mapRef.current.fitBounds(bounds);
    }
  }, [markers, selectedMarkerId, sdkLoaded]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[color:var(--color-outline-variant)]/20 shadow-inner bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <style jsx global>{`
        /* Styled overrides for google maps default elements */
        .gm-style-iw {
          background-color: rgb(15 23 42 / 0.95) !important;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 14px !important;
          padding: 0 !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
        }
        .gm-style-iw-d {
          overflow: hidden !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .gm-style-iw-tc::after {
          background: rgb(15 23 42 / 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        /* Hide developer mode warnings in dev sandbox dynamically if needed */
        .gm-err-container {
          background-color: #1e1b4b !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
