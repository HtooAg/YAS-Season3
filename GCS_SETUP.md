# Google Cloud Storage Setup Guide

## Project Information

-   **Project ID**: yas-school
-   **Project Number**: 304708280481
-   **Bucket Name**: yas-data

## Prerequisites

1. Make sure `gcs_key.json` is in the project root
2. Install dependencies:

```bash
npm install
```

## Initialize Admin Credentials

Run this command to create the admin credentials in Google Cloud Storage:

```bash
npm run init-admin
```

This will create `/yas-data/admin/admin.json` with:

-   Username: `eric@fantasia.com`
-   Password: `yas2025`

## Manual Admin Credentials Setup (Alternative)

If you prefer to use curl or another tool to POST the admin credentials:

```bash
curl -X POST http://localhost:3000/api/admin \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"eric@fantasia.com\",\"password\":\"yas2025\"}"
```

Or after deployment:

```bash
curl -X POST https://your-app-url.run.app/api/admin \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"eric@fantasia.com\",\"password\":\"yas2025\"}"
```

## Google Cloud Storage Structure

The bucket `yas-data` will have the following structure:

```
yas-data/
├── admin/
│   └── admin.json                    # Admin credentials
├── game/
│   └── state.json                    # Current game state
└── teams/
    ├── A/
    │   ├── data.json                 # Team A data
    │   └── scenarios/
    │       ├── scenario-0.json       # Answer for scenario 0
    │       ├── scenario-1.json       # Answer for scenario 1
    │       └── ...
    ├── B/
    │   ├── data.json                 # Team B data
    │   └── scenarios/
    │       └── ...
    └── C/
        ├── data.json                 # Team C data
        └── scenarios/
            └── ...
```

## API Endpoints

### Admin Endpoints

#### GET /api/admin

Get admin credentials from GCS

```bash
curl http://localhost:3000/api/admin
```

#### POST /api/admin

Create/Update admin credentials

```bash
curl -X POST http://localhost:3000/api/admin \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"eric@fantasia.com\",\"password\":\"yas2025\"}"
```

### Game State Endpoints

#### GET /api/game

Get current game state

```bash
curl http://localhost:3000/api/game
```

#### POST /api/game

Save game state

```bash
curl -X POST http://localhost:3000/api/game \
  -H "Content-Type: application/json" \
  -d @game-state.json
```

#### PUT /api/game

Update game state

```bash
curl -X PUT http://localhost:3000/api/game \
  -H "Content-Type: application/json" \
  -d @game-state.json
```

#### DELETE /api/game

Reset game (deletes all game data)

```bash
curl -X DELETE http://localhost:3000/api/game
```

### Team Endpoints

#### GET /api/teams/[teamId]

Get team data (teamId: A, B, or C)

```bash
curl http://localhost:3000/api/teams/A
```

#### POST /api/teams/[teamId]

Create team

```bash
curl -X POST http://localhost:3000/api/teams/A \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"A\",\"coins\":1000,\"crops\":10,\"answers\":{}}"
```

#### PUT /api/teams/[teamId]

Update team

```bash
curl -X PUT http://localhost:3000/api/teams/A \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"A\",\"name\":\"Team Alpha\",\"crop\":\"Dates & Citrus\",\"coins\":1200,\"crops\":15,\"answers\":{}}"
```

#### DELETE /api/teams/[teamId]

Reset team to initial state

```bash
curl -X DELETE http://localhost:3000/api/teams/A
```

#### POST /api/teams/[teamId]/answer

Submit answer for a scenario

```bash
curl -X POST http://localhost:3000/api/teams/A/answer \
  -H "Content-Type: application/json" \
  -d "{\"scenarioIndex\":0,\"choiceId\":\"choice-1\"}"
```

## Build and Deploy to Google Cloud Run

### 1. Build and Submit Docker Image

```bash
gcloud builds submit --tag gcr.io/yas-school/yas-harvest --project=yas-school
```

### 2. Deploy to Cloud Run

```bash
gcloud run deploy yas-harvest \
  --image gcr.io/yas-school/yas-harvest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --project=yas-school
```

### 3. Combined Build & Deploy (Recommended)

```bash
gcloud run deploy yas-harvest \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --project=yas-school
```

### 4. Deploy with Environment Variables

```bash
gcloud run deploy yas-harvest \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars "NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1" \
  --project=yas-school
```

## Features Implemented

### ✅ Google Cloud Storage Integration

-   All game data stored in `yas-data` bucket
-   Admin credentials stored at `/admin/admin.json`
-   Game state stored at `/game/state.json`
-   Team data stored at `/teams/{teamId}/data.json`
-   Scenario answers stored at `/teams/{teamId}/scenarios/scenario-{index}.json`

### ✅ REST API (CRUD Operations)

-   **GET**: Retrieve data from GCS
-   **POST**: Create new data in GCS
-   **PUT**: Update existing data in GCS
-   **DELETE**: Delete/reset data in GCS

### ✅ Real-time Updates with WebSocket

-   All game state changes broadcast via WebSocket
-   Team claims, answer submissions, and game phase changes sync in real-time
-   Multiple clients stay synchronized

### ✅ Reset Game Functionality

-   Admin can reset game to zero state
-   Deletes all game data from GCS
-   Clears all team data and answers
-   Resets to initial lobby state

## Testing Locally

1. Start the development server:

```bash
npm run dev
```

2. Initialize admin credentials:

```bash
npm run init-admin
```

3. Open the app:

-   Player view: http://localhost:3000/player
-   Admin view: http://localhost:3000/admin
-   Admin login: http://localhost:3000/admin/login

4. Test the API:

```bash
# Get admin credentials
curl http://localhost:3000/api/admin

# Get game state
curl http://localhost:3000/api/game

# Get team data
curl http://localhost:3000/api/teams/A
```

## Troubleshooting

### Issue: "Admin credentials not found"

**Solution**: Run `npm run init-admin` to initialize the admin credentials in GCS.

### Issue: "Failed to authenticate with GCS"

**Solution**: Make sure `gcs_key.json` is in the project root and has the correct permissions.

### Issue: "Bucket not found"

**Solution**: Create the bucket in Google Cloud Console:

```bash
gsutil mb -p yas-school -c STANDARD -l us-central1 gs://yas-data
```

### Issue: Docker build fails

**Solution**: Make sure the Dockerfile doesn't reference non-existent files (already fixed).

## Security Notes

-   The `gcs_key.json` file should NEVER be committed to version control
-   Add it to `.gitignore`
-   In production, use Google Cloud Run's built-in service account authentication
-   Consider using Secret Manager for sensitive credentials

## Next Steps

1. ✅ Initialize admin credentials
2. ✅ Test locally
3. ✅ Deploy to Cloud Run
4. ✅ Test in production
5. Monitor logs: `gcloud run logs read yas-harvest --project=yas-school`
