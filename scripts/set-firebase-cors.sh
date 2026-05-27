#!/usr/bin/env bash
set -e
if ! command -v gsutil >/dev/null 2>&1; then
  echo "gsutil not found. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
  exit 1
fi
if [ -z "$1" ]; then
  echo "Usage: $0 BUCKET_NAME"
  exit 1
fi
BUCKET="$1"
echo "Applying CORS config scripts/cors.json to gs://$BUCKET"
gsutil cors set scripts/cors.json gs://$BUCKET
if [ $? -eq 0 ]; then
  echo "CORS successfully applied to $BUCKET"
else
  echo "Failed to apply CORS to $BUCKET"
  exit 1
fi
