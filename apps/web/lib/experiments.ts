import { handParticlesManifest } from "@ttotti/hand-particles/manifest"

export type ExperimentStatus = "live" | "queued" | "sketch"

type ExperimentBase = {
  slug: string
  title: string
  href: string
  status: ExperimentStatus
  input: string
  stack: readonly string[]
  summary: string
  featured?: boolean
}

export type InternalExperiment = ExperimentBase & {
  kind: "internal"
  sourcePath?: string
}

export type ExternalExperiment = ExperimentBase & {
  kind: "external"
  links: {
    live: string
    repo: string
    star?: string
  }
  preview: {
    type: "iframe"
    src: string
    fallbackVideo?: {
      mp4: string
      webm: string
    }
  }
  notes?: readonly string[]
}

export type Experiment = InternalExperiment | ExternalExperiment

export const experiments: Experiment[] = [
  {
    slug: "splatcarve",
    title: "splatcarve",
    href: "/splatcarve",
    kind: "external",
    status: "live",
    featured: true,
    input: "3D Gaussian Splat scene",
    stack: ["Three.js", "Spark", "3DGS", "WebGL", "VFX"],
    summary:
      "browser 3D Gaussian Splat editor for voxel-resolution carving and fragment-level masks",
    links: {
      live: "https://stevekwon211.github.io/splatcarve/",
      repo: "https://github.com/stevekwon211/splatcarve",
      star: "https://github.com/stevekwon211/splatcarve",
    },
    preview: {
      type: "iframe",
      src: "https://stevekwon211.github.io/splatcarve/",
      fallbackVideo: {
        mp4: "https://stevekwon211.github.io/splatcarve/launch/splatcarve.mp4",
        webm: "https://stevekwon211.github.io/splatcarve/launch/splatcarve.webm",
      },
    },
    notes: [
      "press 2 in the live demo to enter carve mode",
      "the fragment mask path is the default mode",
      "source stays in the standalone splatcarve repo",
    ],
  },
  {
    slug: handParticlesManifest.slug,
    title: handParticlesManifest.title,
    href: "/hand-particles",
    kind: "internal",
    status: handParticlesManifest.status,
    input: handParticlesManifest.input,
    stack: handParticlesManifest.stack,
    summary: handParticlesManifest.summary,
    sourcePath: handParticlesManifest.sourcePath,
  },
]

export const featuredExperiment =
  experiments.find((experiment) => experiment.featured) ??
  experiments.find((experiment) => experiment.status === "live") ??
  experiments[0]

export function getExperiment(slug: string) {
  return experiments.find((experiment) => experiment.slug === slug)
}

export function isExternalExperiment(
  experiment: Experiment
): experiment is ExternalExperiment {
  return experiment.kind === "external"
}
