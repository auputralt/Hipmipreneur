# HipmiPreneur "Warm Glass" Redesign

**Date:** 2026-06-05
**Scope:** Full visual redesign of all pages + dark/light mode toggle

## Problem

The current dark sci-fi glassmorphism design feels:
- Too dark and heavy (deep navy `#0c1324`)
- Too cluttered (neon glows, animations, grid patterns everywhere)
- Colors feel cold/impersonal (neon purple `#c0c1ff` + cyan `#5de6ff`)
- No light mode option

## Direction: "Warm Glass"

Keep glassmorphism as the identity. Soften everything else. Add dark/light toggle.

## Color Tokens

### Dark Mode
| Token | Value |
|---|---|
| `--color-background` | `#0f1117` |
| `--color-surface-glass` | `rgba(255,255,255,0.06)` |
| `--color-surface-container-low` | `rgba(255,255,255,0.08)` |
| `--color-surface-container` | `rgba(255,255,255,0.1)` |
| `--color-surface-container-high` | `rgba(255,255,255,0.14)` |
| `--color-primary` | `#a78bfa` |
| `--color-secondary` | `#34d399` |
| `--color-on-surface` | `#e8e8f0` |
| `--color-on-surface-variant` | `#9ca3af` |
| `--color-outline` | `rgba(255,255,255,0.08)` |
| `--color-error` | `#fca5a5` |

### Light Mode
| Token | Value |
|---|---|
| `--color-background` | `#faf9f7` |
| `--color-surface-glass` | `rgba(255,255,255,0.7)` |
| `--color-surface-container-low` | `rgba(0,0,0,0.02)` |
| `--color-surface-container` | `rgba(0,0,0,0.04)` |
| `--color-surface-container-high` | `rgba(0,0,0,0.06)` |
| `--color-primary` | `#7c3aed` |
| `--color-secondary` | `#059669` |
| `--color-on-surface` | `#1f2937` |
| `--color-on-surface-variant` | `#6b7280` |
| `--color-outline` | `rgba(0,0,0,0.06)` |
| `--color-error` | `#ef4444` |

## Visual Changes

1. **Remove**: neon glow box-shadows, grid-pattern background, circuit-line, data-stream animation, ai-float animation, gradient text, pulsing border animations
2. **Soften**: glass blur from 16px to 8px, border opacity reduced
3. **Keep**: glassmorphism panels, sidebar structure, header layout, page patterns, Material Symbols, Indonesian UI text, Inter + Plus Jakarta Sans + JetBrains Mono fonts

## Dark/Light Toggle

- Toggle in TopHeader (sun/moon icon)
- CSS custom properties on `:root` / `[data-theme="light"]`
- localStorage persistence
- System preference detection via `prefers-color-scheme`
- Smooth 200ms transition on theme switch

## Files to Modify

- `app/globals.css` — complete rewrite of theme tokens + utility classes
- `app/layout.tsx` — theme initialization script
- `app/dashboard/layout.tsx` — remove grid pattern bg, cleaner background
- `components/SideNavBar.tsx` — restyle
- `components/TopHeader.tsx` — restyle + theme toggle
- All 15 dashboard pages — swap class names
- `app/onboarding/page.tsx` — restyle
- `app/interviews/public/[id]/page.tsx` — restyle

## Out of Scope

- No component extraction/refactoring
- No layout/structure changes
- No functionality changes
