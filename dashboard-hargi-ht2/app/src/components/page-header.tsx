import { ExternalLink } from "lucide-react";
import { Clock } from "./clock";
import { RefreshButton } from "./refresh-button";
import { ThemeToggle } from "./theme-toggle";

export function PageHeader({
  title,
  subtitle,
  sourceUrl,
  sheetName,
  sheetModified,
  syncTargets,
}: {
  title: string;
  subtitle?: string;
  sourceUrl?: string;
  sheetName?: string | null;
  sheetModified?: string | null;
  syncTargets?: string[];
}) {
  return (
    <header className="rise mb-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
      <div className="drop-shadow-sm">
        <h1 className="text-xl font-bold tracking-tight md:text-2xl text-ink drop-shadow-md">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-xs font-bold bg-gradient-to-r from-blue-600 to-emerald-700 dark:from-blue-400 dark:to-emerald-500 bg-clip-text text-transparent drop-shadow-sm">
            {subtitle}
          </p>
        )}
      </div>

      {/* Kanan atas: [Jam] [Refresh] [Theme] + baris Sumber di bawahnya */}
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          <span className="hidden md:block"><Clock /></span>
          <RefreshButton targets={syncTargets} />
          <ThemeToggle />
        </div>
        {sheetName && (
          <span className="flex items-center gap-1.5 text-[11px] text-ink-3">
            Sumber:{" "}
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
              >
                {sheetName} <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="font-medium">{sheetName}</span>
            )}
            {sheetModified && <span className="num">· Update per {sheetModified}</span>}
          </span>
        )}
      </div>
    </header>
  );
}
