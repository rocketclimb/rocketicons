#!/bin/bash

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
  echo "ERROR: GITHUB_TOKEN environment variable is not set!"
  echo "Please set GITHUB_TOKEN in your Coolify environment variables."
  exit 1
fi

echo "Configuring npm registry..."
npm config set @rocketclimb:registry https://npm.pkg.github.com

echo "Setting up authentication token..."
# Store token in npmrc directly to ensure it's properly set
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> ~/.npmrc

# Verify the token is set
echo "Verifying configuration..."
npm config list | grep -i github

echo "Setup complete. Proceeding with installation..."