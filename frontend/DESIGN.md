# Design System: ORvexia — The Kinetic Architect

## 1. Visual Theme & Atmosphere
The atmosphere is **"Kinetic Productivity."** This is a high-density digital cockpit designed for enterprise-grade automation. It avoids the soft, generic roundness of consumer apps in favor of a precision-engineered, industrial aesthetic. The interface feels weightless yet tactile—like a high-end physical control panel. It uses deep tonal depth to separate "The Void" (background) from "The Controls" (interactive surfaces).

*   **Density:** 8/10 (High density, data-rich compositions)
*   **Variance:** 7/10 (Intentional asymmetry to guide the user's eye through complex workflows)
*   **Motion:** 7/10 (Liquid spring-physics for node connections and staggered reveals)

## 2. Color Palette & Roles
The palette is grounded in the deep spectrum of industrial slate and high-contrast solar energy.

*   **Obsidian Void** (#09090B) — Primary app background (Zinc-950)
*   **Control Surface** (#18181B) — Default card and container fill (Zinc-900)
*   **Elevated Panel** (#27272A) — Hover states and higher-tier components (Zinc-800)
*   **Solar Flare** (#FF5F1F) — Single primary accent for CTAs, active nodes, and focus rings. (Vibrant but controlled).
*   **Ghost Ink** (#A1A1AA) — Secondary text and descriptions (Zinc-400)
*   **Crisp Lead** (#FAFAFA) — Primary headlines and critical data (Zinc-50)
*   **Laser Wire** (rgba(255,95,31,0.15)) — Interactive connection lines and subtle glows.

## 3. Typography Rules
*   **Display/Headlines:** **Satoshi** (or **Outfit**) — Track-tight (-0.02em), heavy weight (Black/Bold), used for high-impact editorial statements.
*   **Body:** **Satoshi** — Optimized for high legibility at 14px-16px. Relaxed leading (1.6).
*   **Mono:** **JetBrains Mono** — Mandatory for all metrics, IDs, workflow logic, and technical metadata.
*   **Banned:** Inter (generic), generic system fonts, and any serif fonts (too editorial for a technical cockpit).

## 4. Component Stylings
*   **Buttons:** Hard-edged tactile feel. Primary: Solar Flare fill, Crisp Lead text. Active: -1px Y-translate. Secondary: Ghost/Outline with Laser Wire focus.
*   **Cards:** Sharper, architectural rounded corners (1.5rem / 24px). No outer glows. Boundaries defined by tonal shifts (Elevated Panel on Obsidian Void).
*   **Inputs:** Minimalist under-line or subtle 1-pixel borders using Elevated Panel colors. Focus state: 2px bottom border in Solar Flare.
*   **Workflow Nodes:** Should feel like physical modules. Use semi-transparent backgrounds with heavy backdrop-blur (20px) to show the "Laser Wire" connections passing beneath them.
*   **Loaders:** Custom "Pulse-Line" shimmer that mimics electrical flow through a circuit. No generic spinners.

## 5. Layout Principles
*   **Asymmetric Cockpit:** Sidebars and utility panels use varied widths. No symmetrical 50/50 splits. 
*   **The Grid:** Strict 4px/8px spacer system for alignment. 
*   **No Overlapping:** Elements must occupy their own spatial zone. Z-index is used exclusively for functional elevation (modals/drawers).
*   **Full-Height Panels:** Main dashboard views must use `min-h-[100dvh]` to avoid layout shifts on mobile.

## 6. Motion & Interaction
*   **Spring Physics:** `stiffness: 120, damping: 18` for a "snappy yet weighted" feel.
*   **Liquid Connections:** Workflow lines (SVG paths) should animate with a "dash-offset" crawl to indicate data flow.
*   **Perpetual Motion:** Active AI agents have a subtle "breathing" scale animation (1.02x).
*   **Staggered Entrance:** Lists of workflows or analytics cards enter via a 0.05s staggered waterfall.

## 7. Anti-Patterns (Banned)
*   **NO** emojis in the enterprise interface.
*   **NO** generic purple/blue "AI" glows.
*   **NO** 3-column equal grids for features.
*   **NO** rounded pill-buttons (too soft for industrial precision).
*   **NO** pure black (#000000).
*   **NO** fabricated metrics (use [metric] for placeholders).
*   **NO** AI clichés like "Unleash your potential." Use direct, functional copy.
