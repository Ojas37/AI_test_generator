# AI Test Generator

AI Test Generator is a TypeScript monorepo for creating and reviewing test-suite
templates from project sources such as PRDs and API specifications.

> **Current implementation note:** the generator is a prototype. It does not
> call an LLM or parse source content semantically. It currently produces
> deterministic test templates and keyword-based canned chat responses.

## Features

- Project and source management
- Asynchronous generation-job workflow with progress polling
- Test-suite and test-case browsing
- Requirement traceability and coverage views
- Dashboard statistics and framework breakdown
- Chat-style test refinement interface
- OpenAPI-driven generated API clients and Zod schemas

## Generated test formats

The backend currently has templates for:

- Jest
- Pytest
- Playwright
- Cypress
- Postman
- JUnit

The generated scenarios include happy paths, negative cases, boundary values,
authentication and authorization, security, concurrency, rate limiting,
pagination, schema validation, and network error cases. The output is
framework-shaped starter code and may require project-specific paths, inputs,
selectors, fixtures, and assertions before it can run.

## Repository layout

```text
artifacts/api-server/       Express API server
artifacts/testgen/          Main React/Vite frontend
artifacts/mockup-sandbox/   Separate UI prototype
lib/api-spec/               OpenAPI source specification and Orval config
lib/api-client-react/       Generated React Query client
lib/api-zod/                Generated Zod request/response schemas
lib/db/                     Drizzle ORM schema and database package
scripts/                    Seed and utility scripts
```

## Technology stack

- Node.js 24
- pnpm workspaces
- TypeScript 5.9
- React 19 and Vite
- Express 5
- PostgreSQL and Drizzle ORM
- Zod and drizzle-zod
- TanStack React Query
- Tailwind CSS and Radix UI

## Prerequisites

- Node.js 24
- pnpm
- PostgreSQL

Install dependencies from the repository root:

```bash
pnpm install
```

The repository configures pnpm to require packages to have been published for
at least 24 hours as a supply-chain safety measure.

## Environment variables

The API server requires:

```text
DATABASE_URL=postgresql://user:password@localhost:5432/database
PORT=5000
```

Do not commit `.env` files or credentials. Use a local environment file or
environment-management tooling.

## Development commands

Run the API server:

```bash
pnpm --filter @workspace/api-server run dev
```

Run the frontend:

```bash
pnpm --filter @workspace/testgen run dev
```

Run typechecking:

```bash
pnpm run typecheck
```

Build all packages:

```bash
pnpm run build
```

Regenerate API clients and schemas after changing the OpenAPI specification:

```bash
pnpm --filter @workspace/api-spec run codegen
```

Push the development database schema:

```bash
pnpm --filter @workspace/db run push
```

## API

The API is mounted below `/api`. Main route groups include:

- `GET /api/healthz`
- `/api/projects`
- `/api/sources`
- `/api/generate`
- `/api/jobs`
- `/api/test-suites`
- `/api/requirements`
- `/api/coverage`
- `/api/stats`
- `/api/chat/messages`

The contract source is
[`lib/api-spec/openapi.yaml`](./lib/api-spec/openapi.yaml). Generated clients
should be regenerated rather than edited manually.

## Project status and limitations

This is currently a demonstration/prototype application. Before production
use, it should add an actual model provider and source parsing pipeline,
authentication and authorization, durable background workers, centralized API
error handling, rate limiting, production-grade coverage calculations, and
automated unit/integration tests.
