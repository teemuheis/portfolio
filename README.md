This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Spotify Mood FastAPI Experiment

The portfolio includes an optional local FastAPI backend for the Spotify Mood project. It runs in parallel with the existing Next.js API route, so production can keep using the current implementation while the Python backend is tested locally.

Backend setup:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env` or export these values in your shell. Do not commit env files.

```bash
export SPOTIFY_CLIENT_ID="..."
export SPOTIFY_REFRESH_TOKEN="..."
# Optional, only for confidential-client Spotify apps:
export SPOTIFY_CLIENT_SECRET="..."
export SPOTIFY_USE_CLIENT_SECRET="true"
```

Run FastAPI on `127.0.0.1:8000`:

```bash
cd backend
source .venv/bin/activate
set -a
source .env
set +a
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Run Next on `localhost:3000` and point the client at FastAPI:

```bash
NEXT_PUBLIC_SPOTIFY_BACKEND_URL=http://127.0.0.1:8000 npm run dev
```

Without `NEXT_PUBLIC_SPOTIFY_BACKEND_URL`, the Spotify Mood page keeps using the existing Next route at `/api/spotify/recommendations`.

Backend checks:

```bash
cd backend
PYTHONPATH=. pytest
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
