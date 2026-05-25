import { ExternalExperimentShowcase } from "@/components/external-experiment-showcase"
import { LabSidebar } from "@/components/lab-sidebar"
import { getExperiment, isExternalExperiment } from "@/lib/experiments"
import { notFound } from "next/navigation"

export default function SplatcarvePage() {
  const experiment = getExperiment("splatcarve")

  if (!experiment || !isExternalExperiment(experiment)) {
    notFound()
  }

  return (
    <main className="min-h-svh bg-lab-bg text-lab-text lg:grid lg:h-svh lg:grid-cols-[272px_minmax(0,1fr)] lg:overflow-hidden">
      <LabSidebar activeSlug={experiment.slug} />
      <ExternalExperimentShowcase experiment={experiment} />
    </main>
  )
}
