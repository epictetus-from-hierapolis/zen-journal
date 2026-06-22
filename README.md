# ZenJournal

ZenJournal is a modern, minimalist note-taking and journaling workspace built with Angular. It is designed to provide a distraction-free, fast, and secure way to manage your notebooks and notes, leveraging a local database and a reactive architecture.

## 🚀 Features

- **Offline-First Architecture**: Powered by [Dexie.js](https://dexie.org/) (an IndexedDB wrapper), ensuring all your notes are stored securely on your local device and remain fully accessible offline.
  * *Architectural Decoupling*: UI components communicate with a local `/api` simulation intercepted by `dexieBackendInterceptor`. This separates frontend logic from database details, allowing a smooth migration to a real Node.js backend in the future.
- **State & Orchestration Facade**: Implements the **Workspace Facade Pattern** (`WorkspaceFacadeService`) to manage application state (signals) and orchestrate async actions, keeping data services completely stateless ("dumb") and resolving potential circular dependency issues.
- **Rich-Text Editor**: Features a responsive writing area built on top of [TipTap Editor](https://tiptap.dev/), supporting standard keyboard formatting, bullet lists, and heading hierarchies (H1/H2).
- **Notebook Management**: Create, select, rename, and delete custom notebooks. 
- **Database-Level Cascade Delete**: Deleting a notebook automatically triggers a Dexie database transaction that purges the notebook and all associated notes, preserving data integrity.
- **Optimistic UI & Rollbacks**: UI updates instantly (e.g., notebook/note creation and deletion) for a highly responsive user experience. If a background HTTP/database request fails, a robust rollback mechanism automatically restores the previous state.
- **Autosave**: Automatic debounce-controlled saving as you type, keeping your data secure without manual saves.
- **Clean Responsive UI**: Styled with [Tailwind CSS](https://tailwindcss.com/) for a sleek, modern, and adaptive interface supporting mobile and desktop layouts.

## 🛠️ Technology Stack

- **Frontend Framework**: [Angular](https://angular.dev/) (v21)
- **State & Reactivity**: Angular Signals & RxJS
- **Rich-Text Engine**: [TipTap Editor](https://tiptap.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Local DB / IndexedDB Wrapper**: [Dexie.js](https://dexie.org/)
- **Testing**: [Jest](https://jestjs.io/) & jsdom

## 📦 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd zen-journal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## ⚙️ Development Server

To start the local development server, run:

```bash
npm start
```
or 
```bash
ng serve
```

Once the server starts, navigate to `http://localhost:4200/`. The page will reload automatically if you modify the source files.

## 🏗️ Building for Production

To compile and optimize the project for production, run:

```bash
npm run build
```

The optimized build artifacts will be stored in the `dist/` directory.

## 🧪 Testing

To run the Jest unit tests, execute:

```bash
npm run test
```

## 📁 Project Structure

The project follows a clean, feature-based modular structure:

- `src/app/features/`: Feature modules.
  - `auth/`: Authentication views and logic.
  - `notebooks/`: Notebook UI components (sidebar and creation modals).
  - `notes/`: Note listing, searching, and TipTap editing components.
- `src/app/shared/`: Shared services, models, and UI utilities.
  - `models/`: TypeScript models (e.g., `Note`, `Notebook`, `Tag`).
  - `services/`: Core application services:
    - `DatabaseService`: Dexie database schema and migration configurations.
    - `NotesService` / `NotebooksService`: Pure, stateless API communication services.
    - `WorkspaceFacadeService`: Coordinates global state and operations.
  - `interceptors/`: Network middleware (e.g., `dexieBackendInterceptor` for local DB routing).
  - `ui/`: Shared pipes and UI helpers (e.g., `relativeTime`, `wordCount`).

## 📄 License

This project is licensed under the MIT License.
