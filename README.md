# Mouse Jerry – Frontend

Online game store UI, re-engineered for SE327. Stack: Vue 3 + Pinia + Vue Router, Tailwind CSS 4, Vite, TypeScript. The API lives in the backend repo (`SE327-project-mouse-jerry-backend`, Spring Boot + PostgreSQL).

## Getting started

Requirements: Node 22 (`nvm use` reads `.nvmrc`), npm, Git.

```bash
git clone <this repo>
cd se327-mouse-jerry-frontend
npm ci          # install exact versions from package-lock.json
npm run dev     # http://localhost:5173
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Type-check (`vue-tsc`) then production build to `dist/` |
| `npm test` | Vitest with coverage; writes `coverage/lcov.info` for SonarCloud |
| `npm run preview` | Serve the production build locally |

## Project structure

```
src/
  main.ts        app entry (Pinia, router)
  App.vue        root component
  router/        route table
  views/         one component per page
  components/    reusable UI; tests in components/__tests__/
  assets/        images, global styles
```

## Workflow

1. Branch from `main`: `feature/<short-name>` or `fix/<short-name>`.
2. Commit small, imperative messages (`Add product card component`).
3. Run `npm run build && npm test` before pushing.
4. Open a pull request. CI builds, tests, and runs SonarCloud; the quality gate must pass.
5. The other team member reviews and approves. Merge only when checks are green.

Never push straight to `main`. New code needs tests: the quality gate checks coverage on new code.

## CI

`.github/workflows` runs install, build, tests and the SonarCloud scan on every push to `main` and every pull request. Config: `sonar-project.properties`. The `SONAR_TOKEN` secret is set in the GitHub repo settings.
