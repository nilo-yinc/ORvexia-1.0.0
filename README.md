# ORvexia

ORvexia is a high-performance, real-time workflow management platform designed for seamless automation and process optimization. Built with a modern tech stack, it provides a robust engine for executing and monitoring complex workflows.

## Features

- **Real-time Monitoring**: Track workflow executions and system health in real-time.
- **Visual Workflow Builder**: Intuitive canvas for designing complex automation flows.
- **Multi-App Integration**: Seamlessly connect with external services like Gmail, Slack, and GitHub.
- **Robust Engine**: Powered by a high-performance Express.js backend.
- **Secure Authentication**: Built-in support for OAuth 2.0 and JWT-based session management.

## Project Structure

- `frontend/`: React + Vite application for the user interface.
- `backend/express/`: Node.js + Express server for the workflow engine and API.

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB

### Installation

1. Clone the repository.
2. Install dependencies for both frontend and backend:
   ```bash
   cd frontend && npm install
   cd ../backend/express && npm install
   ```

### Running Locally

1. Configure environment variables in `backend/express/.env` and `frontend/.env`.
2. Start the backend:
   ```bash
   cd backend/express && npm start
   ```
3. Start the frontend:
   ```bash
   cd frontend && npm run dev
   ```

## License

MIT
