# Box Admin

Nuxt 4 admin workspace for the Box subscription platform.

## Local development

Install dependencies:

```bash
npm install
```

Start the development server on `http://localhost:3001`:

```bash
npm run dev
```

The admin app talks to the backend through `NUXT_PUBLIC_API_BASE`. You can
copy `.env.example` to `.env` and point it at your API when working locally.

## Production

Build the app:

```bash
npm run build
```

Run the production server locally:

```bash
PORT=8080 npm run start
```

## Deploy to Google Cloud Run

This project includes a `Dockerfile` for Cloud Run.

Deploy from the `BoxAdmin` directory:

```bash
gcloud run deploy box-admin \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars NUXT_PUBLIC_API_BASE=https://YOUR_BACKEND_HOST/api
```

When a `Dockerfile` is present, Cloud Run builds the service from that Dockerfile
and stores the image in Artifact Registry automatically.

## Required environment variables

```bash
NUXT_PUBLIC_API_BASE=https://YOUR_BACKEND_HOST/api
```

If `NUXT_PUBLIC_API_BASE` is not set, the app falls back to the current hosted
backend URL defined in `nuxt.config.ts`.

## GitHub auto deploy

This repo now includes a GitHub Actions workflow at
`.github/workflows/deploy-cloud-run.yml`.

It deploys automatically on pushes to `main`, using the same pattern as the
backend project:

- authenticate with a Google service account key
- build a Docker image
- push the image to Artifact Registry
- deploy that image to Cloud Run

### GitHub secrets

Set these repository secrets before enabling the workflow:

```bash
GCP_PROJECT_ID=your-gcp-project-id
GCP_SA_KEY={...full service account key json...}
NUXT_PUBLIC_API_BASE=https://YOUR_BACKEND_HOST/api
```

### Required Google Cloud IAM

The service account stored in `GCP_SA_KEY` should have enough access to:

- push images to Artifact Registry
- deploy Cloud Run services
- act as the Cloud Run runtime service account

At minimum, make sure it can use roles equivalent to:

- `roles/run.admin`
- `roles/iam.serviceAccountUser`
- `roles/artifactregistry.writer`

### Artifact Registry

The workflow expects a Docker Artifact Registry repository named `box-admin` in
`us-central1`.

Create it once if it does not exist:

```bash
gcloud artifacts repositories create box-admin \
  --repository-format=docker \
  --location=us-central1
```
