import { useThemeMode } from "@/contexts/ThemeContext";
import { Moon, Sun, Monitor } from "lucide-react";
import { useState } from "react";

export function ThemeToggle() {
  const { mode, setMode, resolved } = useThemeMode();
  const [open, setOpen] = useState(false);

  const label = mode === "system" ? `Auto (${resolved})` : mode;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Toggle theme"
        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        {resolved === "dark" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
        <span className="capitalize hidden sm:inline">{label}</span>
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-md border bg-popover text-popover-foreground shadow-lg"
          role="menu"
          aria-label="Theme options"
        >
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setMode("light");
              setOpen(false);
            }}
            role="menuitem"
          >
            <Sun className="h-4 w-4" /> Light
          </button>
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setMode("dark");
              setOpen(false);
            }}
            role="menuitem"
          >
            <Moon className="h-4 w-4" /> Dark
          </button>
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setMode("system");
              setOpen(false);
            }}
            role="menuitem"
          >
            <Monitor className="h-4 w-4" /> Auto
          </button>
        </div>
      )}
    </div>
  );
}
