# Cloud Run Deployment Fix

## The Problem

Your Cloud Run service is getting 500 errors because it can't access Google Cloud Storage. The `gcs_key.json` file doesn't exist in production (and shouldn't be committed).

## Solution: Use Cloud Run Service Account

### Option 1: Use Default Compute Service Account (Quick Fix)

```bash
# Get your project number
gcloud projects describe yas-school --format="value(projectNumber)"

# Grant Storage permissions to the default service account
gcloud projects add-iam-policy-binding yas-school \
  --member="serviceAccount:304708280481-compute@developer.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Redeploy with the service account
gcloud run deploy yas-harvest \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --service-account=304708280481-compute@developer.gserviceaccount.com
```

### Option 2: Create Dedicated Service Account (Recommended)

```bash
# Create a service account for Cloud Run
gcloud iam service-accounts create yas-harvest-runner \
  --display-name="YAS Harvest Cloud Run Service Account"

# Grant Storage permissions
gcloud projects add-iam-policy-binding yas-school \
  --member="serviceAccount:yas-harvest-runner@yas-school.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Deploy with the service account
gcloud run deploy yas-harvest \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --service-account=yas-harvest-runner@yas-school.iam.gserviceaccount.com
```

## Verify the Fix

After redeploying, check the logs:

```bash
gcloud run services logs read yas-harvest --region us-central1 --limit 50
```

The 500 errors should be gone and you should see successful API calls.
