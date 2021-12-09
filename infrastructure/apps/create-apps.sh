#!/bin/bash -e

source ./common.sh

if ! command -v az; then
  die "'az' command is not available: the Azure CLI is required"
fi

if [ ! -n "$APP_NAME" ]; then
  die "Missing env variable 'APP_NAME' ✗"
fi

az ad app create --display-name "$APP_NAME API NON-PROD" --app-roles @api-manifest.json > $APP_NAME-api-create-output.json

az ad app create --display-name "$APP_NAME SPA NON-PROD" > $APP_NAME-spa-create-output.json
