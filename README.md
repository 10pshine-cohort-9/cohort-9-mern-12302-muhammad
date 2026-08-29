# cohort-9-mern-12302-muhammad
Cohort 9 — MERN (NodeJS+ReactJS) assignment for Muhammad Ahmad

## Code Quality (SonarCloud)

This repo is analyzed on [SonarCloud](https://sonarcloud.io) (project key
`MuhammadAhmad-18_cohort-9-mern-12302-ahmad`, org `muhammadahmad-18`), configured via
[`sonar-project.properties`](sonar-project.properties) at the repo root, covering both `backend/` and `frontend/`.

**Automatic (CI):** [`.github/workflows/sonarcloud.yml`](.github/workflows/sonarcloud.yml) runs on every push to
`main`/`develop` and on every pull request — it spins up a MySQL service, runs both test suites with coverage, then
triggers the SonarCloud scan. It authenticates using the `SONAR_TOKEN` repo secret.

**Manual / local run:**
1. Generate coverage reports (SonarCloud reads these as `lcov.info`):
   ```
   cd backend && npm run test:coverage
   cd ../frontend && npm run test:coverage
   ```
2. Run the scanner from the repo root:
   ```
   npx sonar-scanner -Dsonar.token=<your-token>
   ```

Exported PDF reports from the SonarCloud dashboard go in [`sonarqube-reports/`](sonarqube-reports/).
