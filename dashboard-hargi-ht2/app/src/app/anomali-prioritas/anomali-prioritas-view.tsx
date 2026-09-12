"use client";

import { useMemo, useState } from "react";
import MapGL, { Marker, Popup, NavigationControl, FullscreenControl } from "react-map-gl/maplibre";
import { MapPin, AlertTriangle, X, Map as MapIcon, Maximize, Minimize } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";

const GOOGLE_MAPS_STYLE = {
  version: 8 as const,
  sources: {
    "google-maps": {
      type: "raster" as const,
      tiles: [
        "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
      ],
      tileSize: 256,
    }
  },
  layers: [
    {
      id: "google-maps",
      type: "raster" as const,
      source: "google-maps",
      minzoom: 0,
      maxzoom: 22,
    }
  ]
};

export function AnomaliPrioritasView({ ahiData = [] }: { ahiData?: any[] }) {
  const [selectedGI, setSelectedGI] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [filterQ, setFilterQ] = useState<string>("All");
  const [filterX, setFilterX] = useState<string>("All");
  const [filterY, setFilterY] = useState<string>("All");

  const uniqueQ = useMemo(() => Array.from(new Set(ahiData.map(d => d.ahi_setelah_evaluasi).filter(Boolean))).sort(), [ahiData]);
  const uniqueX = useMemo(() => Array.from(new Set(ahiData.map(d => d.tier).filter(Boolean))).sort(), [ahiData]);
  const uniqueY = useMemo(() => Array.from(new Set(ahiData.map(d => d.subsistem).filter(Boolean))).sort(), [ahiData]);

  const filteredAhiData = useMemo(() => {
    return ahiData.filter(item => {
      if (filterQ !== "All" && item.ahi_setelah_evaluasi !== filterQ) return false;
      if (filterX !== "All" && item.tier !== filterX) return false;
      if (filterY !== "All" && item.subsistem !== filterY) return false;
      return true;
    });
  }, [ahiData, filterQ, filterX, filterY]);

  // Parse coordinates and group by gardu_induk
  const points = useMemo(() => {
    const giMap = new Map<string, { gardu: string, lat: number, lng: number, data: any[], hasCritical: boolean, hasWarning: boolean }>();
    
    filteredAhiData.forEach(item => {
      if (!item.gardu_induk) return;
      const giName = item.gardu_induk;
      
      if (!giMap.has(giName)) {
        // Try to parse koordinat (format: "lat, lng" or "lat,lng")
        let lat = 0;
        let lng = 0;
        if (item.koordinat) {
          const parts = item.koordinat.split(",");
          if (parts.length >= 2) {
            lat = parseFloat(parts[0].trim());
            lng = parseFloat(parts[1].trim());
          }
        }
        
        giMap.set(giName, {
          gardu: giName,
          lat,
          lng,
          data: [],
          hasCritical: false,
          hasWarning: false
        });
      }
      
      const entry = giMap.get(giName)!;
      entry.data.push(item);
      
      // Check for Critical in AHI SETELAH EVALUASI (Column Q)
      if (item.ahi_setelah_evaluasi && item.ahi_setelah_evaluasi.toLowerCase().includes('critical')) {
        entry.hasCritical = true;
      }

      // Keep original warning logic for popup
      if (item.ahi_terbaru) {
        const val = parseFloat(item.ahi_terbaru.replace(',', '.'));
        if (val < 3) entry.hasWarning = true;
      }
    });
    
    // Filter out items without valid coordinates
    return Array.from(giMap.values()).filter(p => !isNaN(p.lat) && !isNaN(p.lng) && (p.lat !== 0 || p.lng !== 0));
  }, [filteredAhiData]);

  const selectedPoint = useMemo(() => points.find(p => p.gardu === selectedGI), [selectedGI, points]);

  // Hitung statistik (Total Bay unik & Jumlah per jenis MTU)
  const { totalBays, mtuCounts } = useMemo(() => {
    const bays = new Set<string>();
    const counts: Record<string, number> = {};
    
    filteredAhiData.forEach(item => {
      if (item.bay) bays.add(item.bay);
      if (item.mtu) {
        counts[item.mtu] = (counts[item.mtu] || 0) + 1;
      }
    });
    
    return {
      totalBays: bays.size,
      mtuCounts: counts
    };
  }, [filteredAhiData]);

  // Handle escape key to exit fullscreen
  if (typeof window !== "undefined") {
    window.onkeydown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
  }

  return (
    <div className={`w-full flex flex-col gap-4 ${isFullscreen ? 'fixed inset-0 z-[100] bg-surface p-4 overflow-hidden' : ''}`}>
      <div className="flex flex-col gap-3 px-4 py-3 bg-surface rounded-xl border border-edge shadow-sm shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 font-medium text-sm text-accent">
            <MapIcon className="w-5 h-5 shrink-0" />
            <span>Peta Kerawanan Subsistem (Google Maps Style)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)} 
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-accent hover:bg-accent/90 text-white rounded shadow-sm transition-colors mr-2"
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              {isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            </button>
            <div className="text-xs font-semibold px-2.5 py-1 bg-accent/10 text-accent rounded shadow-sm border border-accent/20">
              {points.length} Gardu Induk
            </div>
            <div className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded shadow-sm border border-emerald-500/20">
              {totalBays} Bay
            </div>
            {Object.entries(mtuCounts).map(([type, count]) => (
              <div key={type} className="text-xs font-semibold px-2 py-1 bg-surface-2 rounded shadow-sm border border-edge text-ink-2">
                {type}: <span className="text-ink">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-edge">
          <span className="text-xs font-semibold text-ink-3">Filter:</span>
          <select 
            value={filterQ} 
            onChange={(e) => setFilterQ(e.target.value)}
            className="text-xs bg-surface-2 border border-edge rounded px-2 py-1 outline-none focus:border-accent text-ink"
          >
            <option value="All">Semua AHI Setelah Evaluasi (Q)</option>
            {uniqueQ.map(q => <option key={q as string} value={q as string}>{q as string}</option>)}
          </select>
          
          <select 
            value={filterX} 
            onChange={(e) => setFilterX(e.target.value)}
            className="text-xs bg-surface-2 border border-edge rounded px-2 py-1 outline-none focus:border-accent text-ink"
          >
            <option value="All">Semua Tier GI (X)</option>
            {uniqueX.map(x => <option key={x as string} value={x as string}>{x as string}</option>)}
          </select>
          
          <select 
            value={filterY} 
            onChange={(e) => setFilterY(e.target.value)}
            className="text-xs bg-surface-2 border border-edge rounded px-2 py-1 outline-none focus:border-accent text-ink"
          >
            <option value="All">Semua Subsistem (Y)</option>
            {uniqueY.map(y => {
               const label = (y as string).replace(/\n/g, ' / ');
               return <option key={y as string} value={y as string}>{label}</option>
            })}
          </select>
        </div>
      </div>
      
      <div className={`w-full rounded-xl border border-edge bg-surface shadow-sm overflow-hidden flex relative ${isFullscreen ? 'flex-1 min-h-0' : 'min-h-[600px]'}`}>
        <MapGL
          initialViewState={{
            longitude: 109.112,
            latitude: -7.4,
            zoom: 7
          }}
          mapStyle={GOOGLE_MAPS_STYLE}
          style={{ width: "100%", height: "100%", minHeight: isFullscreen ? "100%" : "600px" }}
        >
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />
          {points.map((p, idx) => (
            <Marker
              key={idx}
              longitude={p.lng}
              latitude={p.lat}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedGI(p.gardu);
              }}
            >
              <div className={`cursor-pointer transition-transform hover:scale-125 flex flex-col items-center justify-center group`}>
                <div className={`absolute bottom-full mb-1 px-2 py-0.5 rounded shadow text-[10px] font-bold whitespace-nowrap border ${p.hasCritical ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-ink border-edge'} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
                  {p.gardu}
                </div>
                {/* Bulat kecil sebagai marker dengan efek ping jika critical */}
                <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                  {p.hasCritical && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white shadow-[0_0_8px_rgba(0,0,0,0.5)] ${p.hasCritical ? 'bg-red-600' : 'bg-blue-500'}`}></span>
                </div>
              </div>
            </Marker>
          ))}
          
          {selectedPoint && (
            <Popup
              longitude={selectedPoint.lng}
              latitude={selectedPoint.lat}
              anchor="bottom"
              offset={10}
              onClose={() => setSelectedGI(null)}
              closeButton={false}
              className="z-50"
              maxWidth="90vw"
            >
              <div className="p-2">
                <div className="flex items-center justify-between border-b pb-2 mb-3">
                  <h3 className="font-bold text-base text-ink pr-4 flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-accent" />
                    {selectedPoint.gardu}
                  </h3>
                  <button onClick={() => setSelectedGI(null)} className="text-ink-3 hover:text-ink"><X className="w-5 h-5" /></button>
                </div>
                <div className="max-h-[40vh] overflow-auto custom-scrollbar border border-edge rounded-lg shadow-inner">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-surface z-10 shadow-sm">
                      <tr className="bg-surface-2 border-b border-edge text-ink-2">
                        <th className="p-2.5 whitespace-nowrap font-semibold">Gardu Induk (F)</th>
                        <th className="p-2.5 whitespace-nowrap font-semibold">Bay (G)</th>
                        <th className="p-2.5 whitespace-nowrap font-semibold">MTU (C)</th>
                        <th className="p-2.5 whitespace-nowrap font-semibold">Fasa (H)</th>
                        <th className="p-2.5 whitespace-nowrap font-semibold">Tahun Buat (L)</th>
                        <th className="p-2.5 min-w-[250px] font-semibold">Parameter Pemicu (N)</th>
                        <th className="p-2.5 whitespace-nowrap font-semibold">AHI Setelah Evaluasi (Q)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPoint.data.map((item, i) => {
                        const isCritical = item.ahi_setelah_evaluasi && item.ahi_setelah_evaluasi.toLowerCase().includes('critical');
                        return (
                          <tr key={i} className={`border-b border-edge hover:bg-accent/10 transition-colors text-ink ${isCritical ? 'bg-red-50 dark:bg-red-950/30' : 'bg-surface'}`}>
                            <td className="p-2.5 whitespace-nowrap">{item.gardu_induk || "-"}</td>
                            <td className="p-2.5 font-medium whitespace-nowrap">{item.bay || "-"}</td>
                            <td className="p-2.5 whitespace-nowrap">{item.mtu || "-"}</td>
                            <td className="p-2.5 whitespace-nowrap">{item.fasa || "-"}</td>
                            <td className="p-2.5 whitespace-nowrap text-center">{item.tahun_buat || "-"}</td>
                            <td className="p-2.5 text-[11px] leading-relaxed max-w-md whitespace-normal">{item.parameter_pemicu || "-"}</td>
                            <td className="p-2.5 whitespace-nowrap">
                              {isCritical ? (
                                <span className="inline-flex items-center gap-1.5 font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded shadow-sm border border-red-200 dark:border-red-800">
                                  <AlertTriangle className="w-3.5 h-3.5" /> {item.ahi_setelah_evaluasi}
                                </span>
                              ) : (
                                <span className="font-medium">{item.ahi_setelah_evaluasi || "-"}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Popup>
          )}
        </MapGL>

      </div>
    </div>
  );
}
