# Deployment Guide

## Quick Deploy

```bash
cd webapp
npm run deploy
```

This will:
1. Build the production static export
2. Copy files to `~/_git/intervolzdotcom/public/crazytaxi/`
3. Site will be live at **intervolz.com/crazytaxi**

## Manual Deployment

If you need to deploy manually:

```bash
# Build the static export
npm run build

# Files will be in the 'out' directory
# Copy to deployment location
cp -r out/* ~/_git/intervolzdotcom/public/crazytaxi/
```

## Configuration

The deployment is configured in:

**next.config.ts:**
```typescript
{
  output: 'export',           // Generate static HTML
  basePath: '/crazytaxi',     // App lives at /crazytaxi path
  images: {
    unoptimized: true,        // Required for static export
  }
}
```

**package.json:**
```json
{
  "deploy": "npm run build && mkdir -p ~/_git/intervolzdotcom/public/crazytaxi && cp -r out/* ~/_git/intervolzdotcom/public/crazytaxi/ && echo 'Deployed to intervolz.com/crazytaxi'"
}
```

## File Structure

After deployment, the structure will be:
```
~/_git/intervolzdotcom/public/crazytaxi/
├── _next/          # Next.js assets
├── models/         # Blender GLB files
│   ├── city_01.glb
│   └── taxi.glb
├── index.html      # Main page
└── 404.html        # Error page
```

## Asset Paths

The basePath `/crazytaxi` is automatically prepended to all:
- HTML routes
- JavaScript bundles
- CSS files
- Static assets in /public

Model files loaded via `useGLTF('/models/city_01.glb')` will automatically resolve to `/crazytaxi/models/city_01.glb`.

## Testing Locally

To test the production build locally:

```bash
# Build
npm run build

# Serve from the out directory (install if needed)
npx serve out -p 3001

# Visit http://localhost:3001 in browser
# Note: Local testing won't have /crazytaxi prefix
```

To test with the basePath locally, you'd need to configure a local server to serve from `/crazytaxi`.

## Updating After Blender Changes

1. Update your Blender model
2. Export GLB to `public/models/city_01.glb`
3. Regenerate component: `npm run buildcity`
4. Deploy: `npm run deploy`

## Rollback

If you need to rollback:

```bash
# The old files are overwritten, so restore from git
cd ~/_git/intervolzdotcom
git checkout public/crazytaxi/
```

## Notes

- The build creates a fully static site (no Node.js server needed)
- All assets are bundled and optimized
- Uses client-side routing (all routes redirect to index.html)
- No server-side rendering (SSR) - everything runs in the browser
- Perfect for GitHub Pages, Netlify, or any static host
