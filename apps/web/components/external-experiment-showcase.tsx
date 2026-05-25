import type { ExternalExperiment } from "@/lib/experiments"

type ExternalExperimentShowcaseProps = {
  experiment: ExternalExperiment
}

export function ExternalExperimentShowcase({
  experiment,
}: ExternalExperimentShowcaseProps) {
  return (
    <section className="min-h-[calc(100svh-97px)] bg-lab-bg lg:h-full lg:min-h-0 lg:overflow-hidden">
      <iframe
        data-testid="external-preview"
        src={experiment.preview.src}
        title={`${experiment.title} live preview`}
        className="h-full min-h-[calc(100svh-97px)] w-full bg-black lg:min-h-0"
        loading="lazy"
        allow="fullscreen; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </section>
  )
}
