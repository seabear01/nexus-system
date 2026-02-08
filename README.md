# Nexus User Management System

A comprehensive, full-stack User Management Dashboard built with TypeScript, React, and Express.

## Features

*   **User Management**: Create, read, update, and delete users.
*   **RBAC (Role-Based Access Control)**: granular permission management system.
*   **Authentication**: Login system (Mock/Real modes).
*   **Content Management**: Built-in Blog editor and viewer.
*   **AI Integration**: Generate user bios using Google Gemini API.
*   **Profile Management**: Avatar uploads and profile editing.
*   **Architecture**: 
    *   **Frontend**: React 19, Tailwind CSS, Lucide Icons.
    *   **Backend**: Node.js, Express, In-memory Store (Mock DB).

## Project Structure

*   `/frontend`: React application logic, pages, components.
*   `/backend`: Express server and data store logic.
*   `index.html`: Main entry point (SPA).

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start the Server**
    *   For the frontend (if using Vite/Parcel):
        ```bash
        npm start
        ```
    *   For the backend:
        ```bash
        ts-node backend/index.ts
        ```

## Configuration

*   **Mock vs Real API**: 
    Edit `frontend/services/api.ts` and toggle `const USE_MOCK_API = true;` to switch between the browser-based mock database and the real Node.js backend.

*   **Gemini API**:
    To use AI features, ensure `process.env.API_KEY` is available or configure it in `frontend/services/geminiService.ts`.
