"use client";

import { getIcon, ICON_KEYS } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  color?: string;
}

export function IconPicker({ value, onChange, color }: IconPickerProps) {
  return (
    <div
      className="grid max-h-40 grid-cols-8 gap-1.5 overflow-y-auto rounded-lg border p-2"
      role="radiogroup"
      aria-label="Icône"
    >
      {ICON_KEYS.map((key) => {
        const Icon = getIcon(key);
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={key}
            onClick={() => onChange(key)}
            className={cn(
              "flex aspect-square items-center justify-center rounded-md transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              selected && "bg-accent"
            )}
            style={selected && color ? { color } : undefined}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
