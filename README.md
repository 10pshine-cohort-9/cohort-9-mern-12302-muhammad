# cohort-9-mern-12302-muhammad
Cohort 9 — MERN (NodeJS+ReactJS) assignment for Muhammad Ahmad

## Code Quality (SonarQube)

This repo is configured for SonarQube/SonarCloud analysis via [`sonar-project.properties`](sonar-project.properties)
at the repo root, covering both `backend/` and `frontend/`.

1. Generate coverage reports (SonarQube reads these as `lcov.info`):
   ```
   cd backend && npm run test:coverage
   cd ../frontend && npm run test:coverage
   ```
2. Run the scanner from the repo root:
   ```
   npx sonar-scanner -Dsonar.host.url=<your-server-url> -Dsonar.token=<your-token>
   ```
3. Exported PDF reports from the SonarQube dashboard go in [`sonarqube-reports/`](sonarqube-reports/).
