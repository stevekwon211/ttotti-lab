ttotti lab is a browser-native creative coding lab for motion, vision, WebGL, and media art.

Small experiments live in this monorepo. Standalone OSS projects stay in their own repositories, but appear here as first-class showcase routes.

Preview demo: https://ttotti-l548ic57a-zero-sq.vercel.app

## Experiments

- `splatcarve`: external showcase for voxel-resolution carving in browser 3D Gaussian Splat scenes.
- `hand-particles`: internal fingertip particle trails powered by MediaPipe Hand Landmarker in `VIDEO` mode.

## Workspace

```text
apps/web                    Next.js App Router site
packages/ui                 shadcn/ui source components
packages/vision             MediaPipe camera and hand tracking wrappers
packages/effects            landmark mapping, smoothing, trail helpers
experiments/hand-particles  first live MediaPipe VFX experiment
```

External showcase routes, such as `/splatcarve`, embed the live project instead of copying source into this workspace.

## Local Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` and visit `/hand-particles` or `/splatcarve`. Camera access requires a secure context in production, so deploy through HTTPS on Vercel.

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

## Notes

This is not an official MediaPipe project. It uses Google MediaPipe Tasks Vision as one input layer for creative coding experiments.

Vercel should use `apps/web` as the project root for the production site.
