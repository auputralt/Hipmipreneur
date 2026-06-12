"use client";

import React from "react";

interface SuggestionChipsProps {
  chips: string[];
  onSelect: (chip: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({ chips, onSelect, disabled }: SuggestionChipsProps) {
  if (!chips || chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2 ml-11 max-w-3xl">
      {chips.map((chip, idx) => (
        <button
          key={idx}
          onClick={() => !disabled && onSelect(chip)}
          disabled={disabled}
          className="px-3.5 py-1.5 rounded-full bg-surface-container-high/50 backdrop-blur-sm border border-outline/30 text-xs text-on-surface-variant hover:text-on-surface hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer disabled:opacity-50"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
