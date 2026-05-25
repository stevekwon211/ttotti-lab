import { LabSidebar } from "@/components/lab-sidebar"
import { HandParticlesDemo } from "@ttotti/hand-particles"

export default function HandParticlesPage() {
  return (
    <main className="min-h-svh bg-lab-bg text-lab-text lg:grid lg:h-svh lg:grid-cols-[272px_minmax(0,1fr)] lg:overflow-hidden">
      <LabSidebar activeSlug="hand-particles" />
      <HandParticlesDemo />
    </main>
  )
}
