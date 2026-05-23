export const handParticlesManifest = {
  slug: "hand-particles",
  title: "hand particles",
  status: "live",
  input: "webcam hand landmarks",
  stack: ["MediaPipe", "Three", "R3F", "Next"],
  summary:
    "fingertip trails driven by MediaPipe Hand Landmarker in VIDEO mode",
  sourcePath: "experiments/hand-particles",
} as const

export type HandParticlesManifest = typeof handParticlesManifest
