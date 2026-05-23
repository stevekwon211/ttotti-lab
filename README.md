ttotti lab is a browser-native creative coding lab for motion, vision, WebGL, and media art.

The first experiment is a MediaPipe hand-tracking VFX sketch. The repo is structured so future work can grow into small open-source packages instead of one-off demos.

Live demo: https://ttotti-lab.vercel.app

## Experiments

- `hand-particles`: fingertip particle trails powered by MediaPipe Hand Landmarker in `VIDEO` mode.
- `face-mesh-masks`: queued face mesh masks, material warps, and shader effects.
- `pose-stage`: queued full-body pose controller for reactive visuals.
- `splat-gestures`: queued gesture-driven Gaussian Splat interaction.

## Workspace

```text
apps/web                    Next.js App Router site
packages/ui                 shadcn/ui source components
packages/vision             MediaPipe camera and hand tracking wrappers
packages/effects            landmark mapping, smoothing, trail helpers
experiments/hand-particles  first live MediaPipe VFX experiment
```

## Local Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` and visit `/experiments/hand-particles`. Camera access requires a secure context in production, so deploy through HTTPS on Vercel.

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
