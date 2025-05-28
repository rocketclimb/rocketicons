# Deployment Guide for RocketIcons Ignition

This guide covers deployment setup for RocketIcons Ignition, including bundle size monitoring.

## Environment Variables

Before deploying, ensure the following environment variable is set in your deployment platform:

```bash
GITHUB_TOKEN=your_github_personal_access_token
```

The token needs `read:packages` permission to access the private `@rocketclimb` npm packages.

## Deployment Scripts

### Option 1: Using Deployment Scripts (Recommended)

For platforms like Coolify, Railway, or other Docker-based deployments:

```bash
# Install dependencies with GitHub authentication
npm run install:with-auth
# or
./scripts/install-with-auth.sh

# Complete build with bundle size checking
npm run build:with-bundle-check
# or
./scripts/build-with-bundle-check.sh
```

### Option 2: Using Deploy Aliases

Convenient aliases for deployment:

```bash
# Install with authentication
npm run deploy:install

# Build with bundle checking
npm run deploy:build
```

### Option 3: Using NPM Scripts

For simpler deployments or CI/CD pipelines:

```bash
# Install with authentication
npm run install:auth

# Build with authentication and size check
npm run build:size-check:auth
```

### Option 4: Manual Commands

If you prefer inline commands:

```bash
# Configure npm for GitHub packages
npm config set @rocketclimb:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken $GITHUB_TOKEN

# Install dependencies
npm ci

# Build with bundle analysis
npm run build
npm run size-check
```

## Bundle Size Monitoring

The deployment process automatically:

1. **Checks bundle size** against the 220MB limit
2. **Generates detailed reports** in `bundle-reports/`
3. **Provides optimization suggestions** if size limits are approached
4. **Fails the build** if size limits are exceeded

### Bundle Size Commands

```bash
# Check current bundle size
npm run size-check

# Generate detailed report
npm run size-report

# Compare with previous builds
npm run size-compare

# Start bundle analyzer server (development)
npm run size-server
```

## Platform-Specific Instructions

### Coolify

1. Set `GITHUB_TOKEN` in environment variables
2. Use build command: `npm run build:with-bundle-check`
3. Use start command: `npm start`

### Railway

1. Set `GITHUB_TOKEN` in environment variables
2. Use build command: `npm run deploy:build`
3. Use start command: `npm start`

### Vercel

1. Set `GITHUB_TOKEN` in environment variables
2. Use build command: `npm run build:size-check:auth`
3. Framework preset: Next.js

### Docker

```dockerfile
# Set environment variable
ENV GITHUB_TOKEN=your_token

# Install and build
RUN npm run build:with-bundle-check

# Start
CMD ["npm", "start"]
```

## Troubleshooting

### Authentication Issues

If you see `401 Unauthorized` errors:

1. Verify `GITHUB_TOKEN` is set correctly
2. Ensure token has `read:packages` permission
3. Check token hasn't expired

### Bundle Size Issues

If bundle size exceeds limits:

1. Run `npm run size-report` for detailed analysis
2. Run `npm run optimization:suggest` for recommendations
3. Check `BUNDLE_ANALYSIS.md` for optimization strategies

### Build Failures

If deployment scripts fail:

1. Ensure scripts are executable: `chmod +x scripts/*.sh`
2. Check you're in the correct directory (`packages/ignition`)
3. Verify all dependencies are available

## Bundle Size Limits

- **Total**: 220 MB (hosting limit)
- **JavaScript**: 150 MB
- **CSS**: 10 MB
- **Media**: 50 MB
- **Other**: 10 MB

Current bundle size is typically ~32 MB (14.4% of limit), well within safe margins.
