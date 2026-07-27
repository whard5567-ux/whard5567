"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Zap, TrendingUp, ClipboardList, Map, LayoutDashboard, ChevronLeft, ChevronRight, Activity, ShieldAlert, Settings, FolderOpen } from "lucide-react";

const NAV = [
  { href: "/pareto", label: "GANGGUAN TRAFO", icon: TrendingUp },
  { href: "/asset-maps", label: "MAPS", icon: Map },
  { href: "/ce-abo", label: "CE 2026", icon: ClipboardList },
  { href: "/abo-2026", label: "ABO 2026", icon: Zap },
  { href: "/ahi-mtu", label: "KONDISI AHI MTU", icon: Activity },
  { href: "/penggantian-mtu", label: "PENGGANTIAN MTU", icon: Settings },
  { href: "/asesment-bushing", label: "MONITORING BUSHING", icon: ShieldAlert },
  { href: "/monitoring-sealing-end", label: "MONITORING SEALING END", icon: ShieldAlert },
  { href: "/penyimpanan-dokumen", label: "PENYIMPANAN DOKUMEN", icon: FolderOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside 
      className={`sticky top-0 z-30 flex h-auto shrink-0 flex-row items-center gap-1 border-b border-edge bg-surface px-3 py-2 backdrop-blur-xl transition-all duration-300 md:h-screen md:flex-col md:items-stretch md:gap-0 md:border-b-0 md:border-r ${
        isOpen ? "w-full md:w-72 md:px-4 md:py-6" : "w-full md:w-16 md:px-2 md:py-6"
      }`}
    >
      <div className={`relative flex items-center md:mb-8 md:w-full ${isOpen ? "justify-between md:flex-col md:justify-center md:gap-4" : "justify-center md:flex-col md:gap-4"}`}>
        <Link href="/" className={`flex items-center gap-3 ${isOpen ? "md:flex-col md:gap-4 md:text-center" : ""}`}>
          <Image 
            src="/logo.jpg" 
            alt="Logo" 
            width={128} 
            height={128} 
            quality={100} 
            className={`shrink-0 object-cover rounded-full shadow-md transition-all duration-300 h-11 w-11 ${isOpen ? "md:h-24 md:w-24" : "md:h-10 md:w-10"}`} 
          />
          {isOpen && (
            <div className="leading-tight hidden md:block">
              <div className="text-2xl font-extrabold tracking-wide text-ink">Hartrans 2</div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-ink-3 mt-1.5">
                Gardu Induk
              </div>
            </div>
          )}
          {/* Mobile title always shows */}
          <div className="leading-tight md:hidden">
            <div className="text-lg font-bold tracking-wide text-ink">Hartrans 2</div>
          </div>
        </Link>
        
        {/* Toggle Button (Desktop Only) */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`hidden md:flex items-center justify-center h-6 w-6 rounded-md hover:bg-surface-2 text-ink-3 hover:text-ink transition-colors ${isOpen ? "absolute right-0 top-0" : ""}`}
          title={isOpen ? "Tutup Menu" : "Buka Menu"}
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex flex-1 flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={!isOpen ? label : undefined}
              className={`flex shrink-0 items-center rounded-lg transition-colors ${
                isOpen ? "gap-2.5 px-3 py-2" : "justify-center p-2 mb-1"
              } ${
                active
                  ? "bg-accent-soft text-accent"
                  : "text-ink-2 hover:bg-surface-2 hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {/* Desktop label (hidden if closed), Mobile label (always shows) */}
              <span className={`truncate text-[13px] font-medium ${!isOpen ? "hidden md:hidden" : "block"}`}>
                {label}
              </span>
              {active && isOpen && <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-accent md:block" />}
            </Link>
          );
        })}
      </nav>

      {isOpen && (
        <div className="hidden items-center md:mt-auto md:flex md:px-2">
          <span className="text-[10px] uppercase tracking-[0.15em] text-ink-3">UIT JBT</span>
        </div>
      )}
    </aside>
  );
}

