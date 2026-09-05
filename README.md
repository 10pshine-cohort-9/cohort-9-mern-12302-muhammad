# Notes and Tasks Management App

A full-stack application built with React, Node.js, Express, and MySQL (Sequelize). This project allows users to manage their notes and tasks seamlessly with a clean, modern user interface.

## 🚀 Features

### Backend
* **RESTful API** built with Express.js.
* **Authentication & Authorization** using JSON Web Tokens (JWT) and bcryptjs for secure password hashing.
* **Database Management** using MySQL and Sequelize ORM. Includes models for `User`, `Note`, and `Task`.
* **Security** implemented via `helmet` and `cors`.
* **Logging** configured using `pino` and `pino-http`.
* **Testing** with `mocha`, `chai`, and `supertest`. Code coverage handled by `nyc`.

### Frontend
* **Modern UI** built with React (Vite) and styled with Tailwind CSS.
* **Routing** managed via React Router DOM.
* **Forms & Validation** powered by React Hook Form.
* **Rich Text Editing** for notes using Quill, with HTML sanitization provided by DOMPurify.
* **State Management** using React Context (AuthContext).
* **API Integration** via Axios.
* **Testing** implemented with Jest and React Testing Library.
* **Linting** with `oxlint`.

## 📂 Project Structure

This is a monorepo containing both the frontend and backend applications:

```text
.
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/           # Database & environment configurations
│   │   ├── controllers/      # Request handlers (auth, notes, tasks)
│   │   ├── middleware/       # Custom Express middleware (auth, error handling)
│   │   ├── models/           # Sequelize ORM models
│   │   ├── routes/           # API endpoints (auth, notes, tasks, health)
│   │   ├── utils/            # Utility functions
│   │   └── app.js            # Express app configuration
│   ├── test/                 # Mocha/Chai integration tests
│   ├── package.json
│   └── server.js             # Application entry point
│
├── frontend/                 # React + Vite Application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context (e.g., Auth)
│   │   ├── hooks/            # Custom React Hooks
│   │   ├── pages/            # Main views (Dashboard, Login, Signup)
│   │   ├── services/         # API services (Axios)
│   │   ├── App.jsx           # Main App component and routing
│   │   └── index.css         # Global styles & Tailwind config
│   ├── __mocks__/            # Jest mocks
│   └── package.json
│
├── .github/workflows/        # CI/CD pipelines
├── sonarqube-reports/        # Exported Code Quality reports
├── .coderabbit.yaml          # CodeRabbit AI config
└── sonar-project.properties  # SonarCloud configuration
```

## 🛠️ Installation & Setup

### Prerequisites
* Node.js (v18+)
* MySQL Server
* npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory (use `.env.example` as a reference):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=notes_app_db
   DB_NAME_TEST=notes_app_db_test
   JWT_SECRET=your_jwt_secret
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🧪 Testing

### Backend Tests
Run integration tests using Mocha & Supertest:
```bash
cd backend
npm test
```
To generate a coverage report:
```bash
npm run test:coverage
```

### Frontend Tests
Run component and unit tests using Jest:
```bash
cd frontend
npm test
```
To generate a coverage report:
```bash
npm run test:coverage
```

## 📊 Code Quality & CI/CD (SonarCloud)

This repository is analyzed on [SonarCloud](https://sonarcloud.io) (project key: `MuhammadAhmad-18_cohort-9-mern-12302-ahmad`, org: `muhammadahmad-18`), configured via `sonar-project.properties` at the repo root.

**Automatic (CI):** `.github/workflows/sonarcloud.yml` runs on every push to `main`/`develop` and on every pull request. It spins up a MySQL service, runs both test suites with coverage, and then triggers the SonarCloud scan using the `SONAR_TOKEN` repository secret.

**Manual / Local Run:**
1. Generate coverage reports (SonarCloud reads these as `lcov.info`):
   ```bash
   cd backend && npm run test:coverage
   cd ../frontend && npm run test:coverage
   ```
2. Run the scanner from the repository root:
   ```bash
   npx sonar-scanner -Dsonar.token=<your-token>
   ```

Exported PDF reports from the SonarCloud dashboard can be found in the `sonarqube-reports/` directory.

## 📜 License
ISC License
