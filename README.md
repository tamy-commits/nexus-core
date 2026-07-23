# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## NEXUS executable evidence API

The FastAPI service is the reference implementation for document-readiness
analysis. It remains fail-closed and never submits an account-opening request.

### Local execution

```sh
python -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

The public frontend origin is allowed explicitly. Override the comma-separated
allowlist without changing source:

```sh
ALLOWED_ORIGINS=https://nexus-blueprint-core.lovable.app
```

### Render deployment

`render.yaml` defines a Docker web service with:

- `/health` as the health-check path;
- deploy only after repository checks pass;
- the public NEXUS frontend as the allowed CORS origin;
- the platform-provided `PORT` value;
- execution as a non-root container user;
- a Free instance for the interview pilot.

The Free instance can spin down after inactivity and may take about one minute
to wake. This is acceptable for the controlled pilot, but it is not a
production service-level objective.

Connect this repository to Render and create a Blueprint from `render.yaml`.
After deployment, configure `VITE_NEXUS_API_URL` in the frontend with the
service URL and keep `VITE_NEXUS_EXECUTION_MODE=DEMO` for the controlled
interview scenario. Use `LIVE` only when the runtime date and production
controls are intentionally enabled.
