---
name: Cyber-Founder Minimal
colors:
  surface: '#0c1324'
  surface-dim: '#0c1324'
  surface-bright: '#32394c'
  surface-container-lowest: '#070e1e'
  surface-container-low: '#141b2c'
  surface-container: '#181f31'
  surface-container-high: '#232a3c'
  surface-container-highest: '#2e3447'
  on-surface: '#dce2fa'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dce2fa'
  inverse-on-surface: '#293042'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#5de6ff'
  on-secondary: '#00363e'
  secondary-container: '#00cbe6'
  on-secondary-container: '#00515d'
  tertiary: '#c0c1ff'
  on-tertiary: '#292b5e'
  tertiary-container: '#8a8cc6'
  on-tertiary-container: '#222457'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#a2eeff'
  secondary-fixed-dim: '#2fd9f4'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#004e5a'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#131449'
  on-tertiary-fixed-variant: '#404176'
  background: '#0c1324'
  on-background: '#dce2fa'
  surface-variant: '#2e3447'
  surface-deep: '#070d1f'
  surface-card: '#191f31'
  surface-glass: rgba(25, 31, 49, 0.4)
  glow-primary: rgba(128, 131, 255, 0.4)
  glow-secondary: rgba(93, 230, 255, 0.6)
  outline-glow: rgba(192, 193, 255, 0.2)
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.01em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  base: 8px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  nav-width: 280px
  margin: 32px
---

## Brand & Style
The Hipmipreneur brand is positioned as a sophisticated, AI-driven partner for modern venture building. The brand personality is **visionary, precise, and tech-forward**. It aims to evoke a sense of high-level clarity amidst the complexity of launching a startup.

The visual style is a fusion of **Glassmorphism** and **Corporate Modernism**. It uses deep, dark-space aesthetics with vibrant neon accents to simulate a "command center" environment. Key visual identifiers include translucent layers with high-radius backdrop blurs, ambient "neural" glows, and high-contrast glowing elements that guide the user through structured roadmaps.

## Colors
The palette is built on a "Deep Space" foundation. The background utilizes a very dark navy (#0c1324) to allow neon accents to pop without causing eye strain. 

- **Primary (Indigo #c0c1ff):** Used for structural guidance, active states, and focus elements. It often carries a glow effect to simulate light-emitting interfaces.
- **Secondary (Cyan #5de6ff):** Represents AI intelligence and confirmation. It is used for "Verify" tags, AI avatars, and status highlights.
- **Surface Strategy:** Tiered levels of dark blue signify hierarchy. The lowest level (#070d1f) is for the sidebar, while higher levels (#191f31) are used for interactive cards and navigation items.

## Typography
The system uses a two-font pairing strategy. **Inter** is used for headlines, navigation, and functional labels to provide a clean, technical, and highly legible interface. **Plus Jakarta Sans** is used for body copy and descriptions, offering a softer, more optimistic feel that balances the technical aesthetic.

For technical details, percentages, and phase counters, **JetBrains Mono** is introduced to provide a "developer" or "under-the-hood" authenticity.

## Layout & Spacing
The layout follows a **Fixed-Sidebar + Fluid Canvas** model. The sidebar remains locked at a `nav-width` of 280px, while the main workspace canvas expands to fill the remaining screen space.

Within the canvas, content is centered in a `max-w-4xl` (approx 896px) container to maintain readability. Spacing is governed by a strict 8px grid system. Standard margins of 32px are used for the main containers, while a 24px gutter is used for internal card padding and vertical separation between components.

## Elevation & Depth
Elevation is conveyed through **backlighting and transparency** rather than traditional drop shadows.

- **Tier 0 (Background):** Solid `#0c1324` with occasional large, low-opacity ambient blurs (`blur-[120px]`) in primary colors.
- **Tier 1 (Glass Layers):** Surfaces use a translucent background (`surface-glass`) with a `backdrop-blur-md` and a soft 1px `outline-glow`.
- **Tier 2 (Interactive Elements):** Cards and active nav items utilize an inner glow (`shadow-[inset_0_0_10px_...]`) and a subtle outer glow that matches the component's accent color (primary or secondary). 
- **Tier 3 (Active Icons/Nodes):** High-intensity glows (`shadow-[0_0_20px_...]`) are used sparingly to highlight the user's current position in a process.

## Shapes
The shape language is defined by **modern roundedness** (0.5rem base). 

- **Primary Containers:** 1rem (`rounded-xl`) to 1.5rem (`rounded-2xl`) for larger surface areas like headers and phase cards.
- **Interactive Components:** 0.5rem (`rounded-lg`) for buttons, search inputs, and navigation links.
- **Decorative Nodes:** Special "Command Nodes" (like the roadmap nodes) are rotated 45 degrees to form diamonds, adding a distinctive technical geometric element to the tracker.

## Components

- **Buttons:** Primary buttons use a gradient border or a semi-transparent tinted fill. The "Ask IVA" floating button should always feature a high-intensity glow and a `primary-fixed` or `inverse-primary` background.
- **Phase Cards:** These use a dual-border strategy—a solid outer border and an internal colored accent strip at the top. Locked cards should drop to 50% opacity and use dashed borders.
- **Progress Trackers:** Vertical lines between roadmap nodes use a gradient (`secondary` to `primary` to `surface-container-high`) to represent the flow of time and logic.
- **Search Inputs:** Fully rounded "pill" shapes (`rounded-full`) with an internal search icon and a background one shade lighter than the header.
- **Navigation Items:** Active states are signaled by a left-aligned vertical indicator bar and a subtle interior glow. Hover states should gently transition the border color to the primary accent.
- **Avatars:** Circular (`rounded-full`) with a thin border and high-quality photography to humanize the venture-building process.