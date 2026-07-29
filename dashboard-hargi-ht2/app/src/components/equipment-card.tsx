import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export interface EquipmentStat {
  total: number;
  closed: number;
  progress: number;
  uraians: { uraian: string; total: number; closed: number; progress: number }[];
}

export function EquipmentCard({ 
  number, 
  title, 
  theme, 
  imageSrc, 
  data 
}: { 
  number: string, 
  title: string, 
  theme: { bg: string, text: string, textValue: string, ring: string }, 
  imageSrc: string, 
  data: EquipmentStat 
}) {
  return (
    <div className="flex flex-col bg-sky-100 dark:bg-sky-100 dark:text-slate-900 rounded-3xl overflow-hidden border-2 border-edge shadow-md h-full min-h-[34rem] hover:shadow-lg transition-shadow duration-300">
      {/* Header Banner */}
      <div className={`flex items-center gap-3 px-5 py-2.5 ${theme.bg}`}>
        <div className="text-3xl font-black italic tracking-tighter text-white drop-shadow-md">
          {number}
        </div>
        <div className="flex-1 font-black text-sm tracking-widest text-white mt-1 uppercase leading-tight">
          {title}
        </div>
      </div>
      
      {/* Top Section */}
      <div className="flex-none p-5 pb-3">
        {/* Visuals */}
        <div className="flex items-center justify-between gap-4 h-36">
          <div className="flex-1 h-full flex items-center justify-center p-2">
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageSrc} alt={title} className="max-w-full max-h-full object-contain drop-shadow-lg" />
            ) : (
              <div className="w-full h-full bg-surface-2 rounded-xl flex items-center justify-center text-ink-3 text-xs">Image</div>
            )}
          </div>
          
          <div className="w-32 flex flex-col items-center shrink-0">
             {/* Circular Progress SVG */}
             <div className="relative w-28 h-28 flex items-center justify-center">
               <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                 {/* Background (Open) */}
                 <path stroke="#f43f5e" strokeWidth="3" fill="none"
                   d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                 {/* Foreground (Realisasi) */}
                 <path stroke="#10b981" strokeDasharray={`${data.progress}, 100`} strokeWidth="3" fill="none"
                   strokeLinecap="round"
                   d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                 <div className="text-[22px] leading-none font-black text-slate-900 tracking-tight mb-0.5">{data.progress}%</div>
                 <div className="text-[8px] font-bold tracking-widest text-slate-600">PROGRES</div>
               </div>
             </div>
          </div>
        </div>
        
        {/* Metrics Row */}
        <div className="flex justify-between items-center mt-5 w-full">
          <div className="flex-1 flex justify-center items-center gap-1.5">
            <div className={`w-5 h-5 rounded-full ${theme.bg} shadow-sm shrink-0`} />
            <div className="flex flex-col">
              <span className={`text-sm font-black leading-none ${theme.textValue}`}>{data.total}</span>
              <span className="text-[7.5px] font-bold text-slate-600 uppercase tracking-wide mt-0.5">Total<br/>Target</span>
            </div>
          </div>
          
          <div className="w-px h-7 bg-edge/60 shrink-0" />
          
          <div className="flex-1 flex justify-center items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-white border border-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black leading-none text-emerald-600">{data.closed}</span>
              <span className="text-[7.5px] font-bold text-slate-600 uppercase tracking-wide mt-0.5">Realisasi<br/>Close</span>
            </div>
          </div>
          
          <div className="w-px h-7 bg-edge/60 shrink-0" />
          
          <div className="flex-1 flex justify-center items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-white border border-rose-400 flex items-center justify-center shrink-0 shadow-sm">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" strokeWidth={3} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black leading-none text-rose-600">{data.total - data.closed}</span>
              <span className="text-[7.5px] font-bold text-slate-600 uppercase tracking-wide mt-0.5">Status<br/>Open</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Section: Uraian */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-sky-200 to-sky-100 rounded-t-3xl border-t-2 border-edge px-5 py-4 overflow-hidden relative">
        <div className="flex justify-between items-center text-[9px] font-black tracking-widest text-slate-600 mb-3 border-b-2 border-edge/50 pb-2">
          <span>URAIAN</span>
          <span>PROGRES</span>
        </div>
        <div className="flex flex-col pr-1 space-y-4 pb-2 relative z-10">
          {data.uraians.map((u, i) => {
            const openCount = u.total - u.closed;
            return (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 leading-tight gap-2">
                <span className="pr-1" title={u.uraian}>{u.uraian}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] font-semibold text-slate-500 tracking-wider">
                    <span className="text-emerald-600">{u.closed} C</span>
                    <span className="mx-0.5 opacity-50">/</span>
                    <span className="text-rose-500">{openCount} O</span>
                  </span>
                  <span className="w-9 text-right">{u.progress}%</span>
                </div>
              </div>
              <div className="h-[6px] w-full bg-surface-3 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${theme.bg}`} style={{ width: `${u.progress}%` }} />
              </div>
            </div>
          )})}
          {data.uraians.length === 0 && (
            <div className="text-xs text-ink-3 italic text-center mt-6">Belum ada data uraian</div>
          )}
        </div>
      </div>
    </div>
  );
}
