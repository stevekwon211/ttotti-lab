import { handParticlesManifest } from "@ttotti/hand-particles/manifest"

export type ExperimentStatus = "live" | "queued" | "sketch"

export type Experiment = {
  slug: string
  title: string
  href: string
  status: ExperimentStatus
  input: string
  stack: readonly string[]
  summary: string
}

export const experiments: Experiment[] = [
  {
    slug: handParticlesManifest.slug,
    title: handParticlesManifest.title,
    href: "/experiments/hand-particles",
    status: handParticlesManifest.status,
    input: handParticlesManifest.input,
    stack: handParticlesManifest.stack,
    summary: handParticlesManifest.summary,
  },
  {
    slug: "face-mesh-masks",
    title: "face mesh masks",
    href: "/experiments",
    status: "queued",
    input: "webcam face landmarks",
    stack: ["MediaPipe", "Three.js", "shaders"],
    summary: "face mesh driven masks, material warps, and camera-space effects",
  },
  {
    slug: "pose-stage",
    title: "pose stage",
    href: "/experiments",
    status: "sketch",
    input: "body pose landmarks",
    stack: ["MediaPipe", "particles", "VJ"],
    summary: "full-body pose as a stage controller for reactive visuals",
  },
  {
    slug: "splat-gestures",
    title: "splat gestures",
    href: "/experiments",
    status: "sketch",
    input: "hand gestures + 3D splats",
    stack: ["MediaPipe", "Gaussian Splatting", "WebGL"],
    summary: "gesture-driven carving and inspection for Gaussian Splat scenes",
  },
]
