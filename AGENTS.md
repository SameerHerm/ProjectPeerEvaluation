# Repository Guidelines

## Evaluate Technical Decisions

Evaluate the user's architecture, design, and implementation choices
against established industry practices and the project's requirements.
Do not agree automatically. If a proposal is impractical, insecure,
unnecessarily complex, or departs from standard practice without a clear
benefit, raise the concern before implementing it. Explain the tradeoffs
and recommend a viable alternative. Distinguish genuine problems from
reasonable alternatives; a nonstandard approach can be acceptable when
its benefits and tradeoffs justify it.

## User Confirmation Before Changes

Before making any changes, explain the proposed changes and ask the user for confirmation. Wait for explicit approval before editing files, installing dependencies, changing configuration, or modifying Git or external state. Read-only inspection may proceed without confirmation.

## Review Changes Before Applying

Present changes in small, logical steps. Before each step, show the
proposed diff and briefly explain what each change does. Identify file
renames with their old and new paths. For large generated files such as
dependency lockfiles, summarize the changes and provide the full diff
for inspection. Wait for explicit approval before applying each step,
then show the resulting diff.

## Project Structure & Module Organization

PEERS is a React peer-evaluation application with an Express/Mongoose API. `index.html` loads `src/index.jsx`, the frontend entry point; `src/frontend/` contains pages, components, authentication context, API services, and styles. `public/` holds static HTML and hosting assets. `src/backend/` contains the API entry point (`index.js`), routes, controllers, models, middleware, configuration, and utilities. The backend includes a manual API check in `src/backend/test_api.js`; database maintenance and sample-data scripts live in `src/backend/scripts/`. Architecture, requirements, and user guides are under `docs/`.

## Build, Test, and Development Commands

Use Node.js satisfying `^22.22.2 || ^24.15.0 || >=26.0.0` and npm 9 or newer. Both packages enforce the runtime requirements with `engine-strict=true`. Run these commands from the repository root:

- `npm run setup`: install frontend and backend dependencies.
- `npm run dev`: start both servers; frontend uses port 3000, backend defaults to 5000.
- `npm run start:frontend` / `npm run start:backend`: start either server independently.
- `npm run build`: produce the frontend production bundle in `build/`.
- `npm run preview`: preview the production frontend locally.
- `npm run lint`: lint frontend, backend, tests, and tooling configuration.
- `npm run format:check` / `npm run format`: check or apply Prettier formatting to application code, tests, setup helpers, manual scripts, and tooling JavaScript/JSX.
- `npm test` / `npm --prefix src/backend test`: run the existing frontend or backend Vitest suite once.
- `npm run test:all`: run both suites once.

Current scripts use Vite and Vitest. Shared ESLint 9 flat configuration lives in `eslint.config.mjs`, using core/import presets for both packages and React, Hooks, and accessibility presets for the frontend. Run shared quality commands from the repository root; backend dependencies do not separately install lint/format tooling. The accepted ESLint 9 end-of-life limitation is documented in `docs/Team-P25-02/eslint-migration.md`.

## Coding Style & Naming Conventions

Use PascalCase for React components and model files, camelCase for functions and variables, and descriptive controller/service names. Frontend code uses ES module imports; backend application code uses CommonJS, while backend tests use ES module imports. ESLint uses its built-in Espree parser and `eslint.config.mjs`. Prettier owns formatting through `prettier.config.cjs` with two spaces and single-quoted JavaScript strings; `eslint-config-prettier` disables conflicting rules. `.prettierignore` excludes dependencies, generated output, and hidden paths; tests and manual API checks share the application formatting policy. Avoid unrelated formatting changes.

## Testing Guidelines

Run lint, formatting checks, and the existing Vitest suites appropriate to the change; verify frontend changes with `npm run build` and affected browser/API workflows. React Testing Library and jsdom support the frontend tests; the backend suite uses Node. Coverage remains limited to the initial test in each package, and no coverage threshold is configured. Use synthetic data and isolate MongoDB/SMTP when adding future tests. Lint and formatting include tests. `@vitest/eslint-plugin` applies its recommended rules only to `src/**/*.{test,spec}.{js,jsx,mjs,cjs}`: focused tests, invalid assertions, and duplicate titles are errors; skipped tests are warnings. Keep Vitest helpers explicitly imported; setup files and manual scripts receive ordinary lint rules without the Vitest preset.

## Commit & Pull Request Guidelines

History mixes descriptive imperative messages and brief fixes; no strict commit format is enforced. Prefer specific messages such as `Fix evaluation invitation links`. Use issue-based feature branches, link issues in PRs, explain behavior changes, report validation, and include screenshots for UI changes. Update relevant documentation.

## Security & Configuration

Use `src/backend/.env.example` as a configuration reference for MongoDB, SMTP, and frontend URLs; configure `JWT_SECRET` explicitly. Keep credentials, tokens, and real student data out of commits. Ensure local `.env` files are ignored before adding files. Use a disposable database for sample-data scripts.
