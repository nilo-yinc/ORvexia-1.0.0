# Site Architecture: ORvexia Architect Canvas

## 1. Overview
ORvexia is a high-fidelity Agentic Workflow Architect. The platform allows users to design, execute, and monitor complex AI-driven logic through a tactile "Engineering-Core" canvas interface.

## 2. Core Navigation
- **Dashboard (`/workflows`)**: List of active and archived workflow modules.
- **Architect Canvas (`/workflows/builder/:id`)**: The primary engineering environment.
- **Templates (`/templates`)**: Library of pre-configured logic blocks and agents.
- **Settings (`/settings`)**: API keys, environment variables, and user configuration.

## 3. Architecture & Components
### Frontend (React/Vite/Tailwind)
- **Canvas Engine**: React Flow v11 with custom `nodeTypes` and `edgeTypes`.
- **Animation Layer**: GSAP for 3D parallax and "Border Beam" effects; Framer Motion for UI state transitions.
- **State Management**: Local React state paired with WebSocket (Socket.io) for real-time execution logs.
- **Design Tokens**: Centralized in `tailwind.config.js` and `.stitch/DESIGN.md`.

### Core Components
- `CustomNode.jsx`: Tactile glass nodes with perspective tilt.
- `CustomEdge.jsx`: Bezier paths with animated data particles.
- `ActivityPalette.jsx`: Collapsible sidebar for blocks/actions.
- `LogStream.jsx`: CRT-style terminal for execution output.
- `ConfigPanel.jsx`: Context-aware node property inspector.
- `CommandKModal.jsx`: Omni-search for templates and actions.

## 4. Interaction Patterns
- **Magnetic Buttons**: Subtle translation towards the cursor on hover.
- **Command-K**: Global omni-search overlay for high-speed navigation.
- **Glass Surfaces**: `backdrop-blur-xl` + `border-white/10` for all floating UI.
- **Real-time execution**: Live status updates via WebSocket with edge-pulsing visualization.
