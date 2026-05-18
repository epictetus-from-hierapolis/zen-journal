# ZenJournal

ZenJournal is a modern, offline-first journaling and note-taking application built with Angular. It is designed to provide a distraction-free, fast, and secure way to manage your personal thoughts, notes, and ideas.

## 🚀 Features

- **Offline-First Architecture**: Built using [Dexie.js](https://dexie.org/) (IndexedDB wrapper), ensuring your notes are always available and securely stored locally on your device, even without an internet connection.
- **Notebooks & Organization**: Group your notes into customizable Notebooks.
- **Tagging System**: Add colors and tags to notes for easy categorization and retrieval.
- **Note States**: Manage the lifecycle of your notes with Active, Archived, and Deleted states.
- **Dark & Light Mode**: Built-in support for theme switching based on your preferences.
- **Autosave**: Configurable autosave delay so you never lose your progress.
- **Modern UI**: Styled utilizing [Tailwind CSS](https://tailwindcss.com/) for a clean and responsive user interface.

## 🛠️ Technology Stack

- **Framework**: [Angular](https://angular.dev/) (v21)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Local Database**: [Dexie.js](https://dexie.org/)
- **Testing**: [Jest](https://jestjs.io/) & [Vitest](https://vitest.dev/)
- **Reactivity**: [RxJS](https://rxjs.dev/)

## 📦 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd zen-journal
   ```

2. Install the dependencies:
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

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## 🏗️ Building for Production

To build the project for production, run:

```bash
npm run build
```
or
```bash
ng build
```

This will compile your project and store the optimized build artifacts in the `dist/` directory.

## 🧪 Testing

### Unit Tests

To execute unit tests using Jest, run:

```bash
npm run test
```

## 📁 Project Structure

The project follows a feature-based modular structure:

- `src/app/features/`: Contains the main feature modules of the application.
  - `auth/`: Authentication and user management (if applicable).
  - `notebooks/`: Notebook management views and logic.
  - `notes/`: Note creation, editing, and listing features.
  - `settings/`: Application settings and configuration options.
- `src/app/shared/`: Shared resources used across different features.
  - `models/`: TypeScript interfaces and types (e.g., `Note`, `Notebook`, `AppSettings`).
  - `services/`: Core application services (e.g., `DatabaseService`, `NotesService`).
  - `ui/`: Reusable, generic UI components.
  - `guards/`, `interceptors/`, `validators/`: Angular utilities.

## 📄 License

This project is licensed under the MIT License.
