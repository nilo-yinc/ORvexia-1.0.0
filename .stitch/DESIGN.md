# Design System: ORvexia Architect Canvas
**Project ID:** 9338013064651602374

## 1. Visual Theme & Atmosphere
ORvexia Architect Canvas is engineered for high-level technical orchestration. The atmosphere is **"Cockpit Dense" (8/10)** and **"Cinematic Engineering" (7/10)** — a restrained, obsidian-and-slate environment that feels like a physical glass terminal suspended in a dark void. It balances the raw, utilitarian precision of an IDE with the premium, polished aesthetics of a luxury hardware interface. 

The visual style is a hybrid of **High-Fidelity Minimalism** and **Glassmorphism**, emphasizing structural clarity through depth, blurs, and realistic light simulation rather than traditional shadows.

## 2. Color Palette & Roles
- **Deep Obsidian** (#030303) — The absolute black "void" background for maximum contrast.
- **Surface Glass** (rgba(255,255,255,0.03)) — Primary fill for floating panels and nodes.
- **Pure High-Contrast** (#F1F5F9) — Primary text for active data and headers.
- **Muted Slate** (#94A3B8) — Secondary text for metadata, labels, and inactive descriptions.
- **Specularity Border** (rgba(255,255,255,0.06)) — 1px structural lines simulating light-catch on glass edges.
- **Architect Orange** (#F97316) — Primary accent for critical status, "Run" actions, and high-priority alerts.
- **Agentic Cyan** (#06B6D4) — Secondary accent for active data flow and AI-driven intelligence paths.
- **Agentic Violet** (#8B5CF6) — Tertiary accent for complex logic and advanced agentic states.

## 3. Typography Rules
- **Display & Headlines:** Inter — Track-tight (-0.02em), weight-driven hierarchy. Headlines are authoritative but restrained.
- **Body:** Inter — Relaxed leading, optimized for high-density technical readouts.
- **Mono:** Geist Mono / JetBrains Mono — For logic expressions, code snippets, timestamps, and log streams.
- **Banned:** Generic system fonts, oversaturated text gradients, and emojis in technical contexts.

## 4. Component Stylings
* **Workflow Nodes:** Glass backgrounds (`bg-white/5`, `backdrop-blur-xl`) with 1px specimen borders. Headers use a subtle background tint based on category.
* **Glass Buttons:** Primary uses Architect Orange (#F97316). Secondary/Ghost use `white/10` borders with tactile hover states.
* **Inputs/Forms:** Dark, recessed backgrounds (`bg-black/40`). On focus, borders transition to a Cyan-to-Violet gradient glow.
* **Status Indicators:** Micro-dots with soft-glow backgrounds. Idle (Grey), Running (Pulsing Amber), Success (Emerald), Error (Rose).
* **Connectors:** 2px wide bezier paths. Active paths feature a "Data Pulse" particle using Agentic Cyan (#06B6D4).

## 5. Layout Principles
- **Fluid Grid Canvas:** 20px interval dot grid background for spatial alignment.
- **Baseline Rhythm:** 4px baseline with 16px (gap-4) standard groupings and 24px (p-6) panel padding.
- **Depth Hierarchy:** 
    1. Base (Absolute Black)
    2. Panels (Frosted Glass)
    3. Interaction (Gradient specularity and luminescence)

## 6. Motion & Interaction
- **GSAP Border Beams:** A 2px gradient stroke that travels along the perimeter of active containers via GSAP timeline.
- **3D Parallax:** Mouse-tracked perspective tilt on nodes and panels to simulate physical depth.
- **Data-Pulse Travel:** SVG `animateMotion` particles flowing along edge paths for real-time execution feedback.
- **Spring Physics:** Weighty transitions (`stiffness: 100, damping: 20`) for all UI panels and modals.

## 7. Anti-Patterns (Banned)
- No emojis anywhere in the technical UI.
- No pure black (#000000) for UI elements — use Obsidian (#030303) as base.
- No generic AI "Purple Neon" glows — use specific Agentic Cyan/Violet tints.
- No filler UI text like "Next-Gen" or "Seamless" — use technical, descriptive labels.
- No 3-column equal card layouts — use asymmetric logic or specialized grids.
