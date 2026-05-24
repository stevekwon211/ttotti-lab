import { LabSidebar } from "@/components/lab-sidebar"
import { experiments } from "@/lib/experiments"
import Link from "next/link"

export default function ExperimentsPage() {
  return (
    <main className="min-h-svh bg-lab-bg text-lab-text lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
      <LabSidebar />

      <section className="min-w-0 bg-lab-surface px-4 py-6 lg:px-6">
        <div className="mx-auto max-w-5xl">
          <header className="border-b border-lab-line pb-7">
            <p className="font-mono text-[11px] tracking-[0.22em] text-lab-dim uppercase">
              all works
            </p>
            <h1 className="mt-3 font-serif text-[2.6rem] leading-[0.95] tracking-normal sm:text-[3.5rem]">
              experiments
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-lab-muted">
              focused demos, kept small enough to become libraries when the
              interaction is worth repeating
            </p>
          </header>

          <div className="mt-6 divide-y divide-lab-line">
            {experiments.map((experiment, index) => (
              <Link
                key={experiment.slug}
                href={experiment.href}
                className="group grid gap-4 py-5 transition hover:bg-lab-panel sm:grid-cols-[84px_minmax(0,1fr)_120px] sm:px-3"
              >
                <div className="font-mono text-xs text-lab-dim">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-lab-text">
                    {experiment.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-lab-muted">
                    {experiment.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {experiment.stack.map((item) => (
                      <span
                        key={item}
                        className="rounded-sm bg-lab-panel px-2 py-1 font-mono text-[10px] text-lab-muted"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-start justify-between gap-3 sm:justify-end">
                  <span className="font-mono text-[10px] tracking-[0.16em] text-lab-ink uppercase">
                    {experiment.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
