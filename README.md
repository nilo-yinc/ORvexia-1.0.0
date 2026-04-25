# ⚡ Orvexia: The Agentic Workflow Architect

> **"Turn Natural Language into Executable Infrastructure."**
> *Automating the robotic drudgery of the 99% using Agentic AI.*

## 🚀 The Problem
In the modern enterprise, **automation is gated by complexity**.
- **Zapier/n8n** require you to understand "Webhooks", "JSON parsing", and logic loops.
- **Camunda** requires you to be a BPMN engineer.
- **Custom Code** requires a development team and weeks of time.

This leaves 90% of the workforce—Operations Managers, HR Leads, Small Business Owners—stuck doing repetitive manual work because they cannot code.

## 💡 The Solution: Orvexia
Orvexia is an **Agentic AI Platform** that democratizes software engineering. It allows users to build enterprise-grade automation workflows simply by speaking.

**This platform does not just chat. It builds.**
The AI acts as a **Senior Workflow Architect** that translates intent into infrastructure, connects APIs, handles error logic, and deploys live workflows in seconds.

---

## 🛠️ Tech Stack

### **Frontend (The Canvas)**
- **Framework:** React.js (Vite)
- **Visualization:** `React Flow` (for rendering the interactive node graph)
- **Styling:** Tailwind CSS + Framer Motion
- **State Management:** Zustand / React Context

### **Backend (The Brain)**
- **API:** FastAPI (Python)
- **AI Engine:** LangChain + Groq (Llama 3 70B)
- **Validation:** Pydantic (Strict Schema Enforcement)
- **Database:** PostgreSQL / SQLite (for persistent workflow state)

### **Agentic Capabilities**
- **Orchestration:** LangGraph (Stateful multi-actor applications)
- **Tooling:** Custom "Tool Sandbox" (Gmail, GitHub, Notion, Slack, Vercel APIs)
- **Memory:** Context-aware history (The AI remembers previous modifications)

---

## ✨ Key Features

### 1. 🧠 AI Builder (Text-to-Software)
The core of Orvexia. Users type a command like:
> *"When I get an email about a bug, summarize it with AI, log it to Notion, and alert the #dev channel on Slack."*
The Agent intelligently selects the right tools, draws the connections, and configures the payloads automatically.

### 2. 🎨 Visual Workflow Editor
Orvexia provides a "Glass Box" experience. Users can see exactly what the AI built using a drag-and-drop node graph (powered by React Flow). This ensures trust and allows for manual fine-tuning.

### 3. 📊 Real-Time Analytics Dashboard
Track the ROI of automation.
- **Time Saved:** Calculated based on average manual execution time.
- **Success Rate:** Monitor workflow health.
- **Execution Trends:** See which workflows are driving value.

### 4. 🛡️ Consultant Mode (Proactive AI)
The AI doesn't just execute; it advises. If a user builds a risky workflow, the AI suggests improvements:
> *"I noticed you are creating a GitHub issue but didn't add a notification step. Should I add a Slack alert for you?"*

---

## 🔒 Security & Reliability
Orvexia solves the "AI Hallucination" problem with a 3-layer defense system:

1.  **Strict Schema Validation (Pydantic):** The AI is forced to output strict JSON matching internal schemas. If it tries to invent a non-existent parameter, the backend rejects it before it reaches the UI.
2.  **Deterministic Tool Sandboxing:** The AI cannot execute arbitrary code. It can *only* call pre-defined, safe functions from `TOOLS_DB`.
3.  **Human-in-the-Loop:** The platform favors "co-piloting" over "auto-piloting." The AI drafts the blueprint, but the human must verify the visual diagram before deployment.

---

## 🆚 Comparison: Why Orvexia?

| Feature | 🐢 Traditional (Zapier/Camunda) | ⚡ Orvexia (Agentic AI) |
| :--- | :--- | :--- |
| **Creation Speed** | Hours (Manual Drag & Drop) | **Seconds** (Natural Language) |
| **User Requirement** | Technical (Logic/APIs) | **Non-Technical** (Intent only) |
| **Flexibility** | Rigid (Static Workflows) | **Fluid** (Self-Correcting AI) |
| **Cost** | High Engineering Overhead | **Zero** Engineering Overhead |

---

## 💰 Business Value
- **Zero-Friction Accessibility:** Unlocks automation for the 500M+ non-technical knowledge workers.
- **Instant ROI:** Reduces "Time-to-Automation" by 99%.
- **Shadow IT Reduction:** Provides a governed, safe environment for employees to build tools without using insecure, unapproved apps.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- Groq API Key

### Installation

1. **Clone the Repo**
   ```bash
   git clone git@github.com:nilo-yinc/ORvexia-1.0.0.git
   cd ORvexia-1.0.0

2. **Backend setup**
   ```bash
   cd backend
    pip install -r requirements.txt
    # Create .env file with GROQ_API_KEY
    uvicorn app.main:app --reload

3. **Frontend setup**
   ```bash
   cd frontend
    npm install
    npm run dev

## Author
Built and maintained by Niloy Mallik.
