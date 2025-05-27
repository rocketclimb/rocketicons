# Vercel Static Optimization

This project implements full static generation for all icon collections and icons to reduce Vercel middleware costs.

## The Problem

Previously, the application used Next.js middleware to handle icon collection pages, which resulted in:

1. High middleware invocation costs on Vercel due to the "Fast Origin Transfer" feature
2. Additional serverless function calls for dynamic routes
3. Slower page loads due to dynamic rendering

## The Solution

We've implemented full static generation for all icon pages:

1. All icon collection landing pages are now statically generated at build time
2. All individual icon pages are statically generated at build time
3. Removed the middleware logic for handling icon URLs

This approach:

- Virtually eliminates middleware costs for icon-related routes
- Improves page load performance as pages are served directly from Vercel's edge network
- Makes the site more resilient as it doesn't rely on middleware or serverless functions for core functionality

## Build Options

Since we have 35 collections with 45,000+ icons, the following build options are available:

### For Development

```bash
# Regular development build (only generates the collection index pages)
npm run build

# Development build with sample icons (generates a few icons per collection)
npm run build-static-sample
```

### For Production

```bash
# Full static generation of all icons and collections
npm run build-static-full

# For Vercel deployment
npm run vercel-build-static
```

## Environment Variables

- `GENERATE_ALL_ICONS=true` - Generates all icons and collections statically
- `GENERATE_SAMPLE_ICONS=true` - Generates a sample of icons for testing

## Performance Impact

- **Build Time**: Full static generation increases build time, but the result is worth it
- **Runtime Performance**: Pages load faster as they're served from the edge
- **Vercel Costs**: Significantly reduces middleware and serverless function costs

## Migration Notes

1. The middleware no longer rewrites collection URLs to `/collection/collection-index.ri`
2. Instead, a page component at `/[lang]/(content)/icons/[collectionid]/page.tsx` handles the redirect statically
3. All icon pages are now pre-rendered at build time
