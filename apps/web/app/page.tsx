import { LabSidebar } from "@/components/lab-sidebar"
import { experiments } from "@/lib/experiments"
import { buttonVariants } from "@ttotti/ui/components/button"
import Link from "next/link"

export default function Page() {
  const liveExperiment =
    experiments.find((experiment) => experiment.status === "live") ??
    experiments[0]
  const queuedExperiments = experiments.filter(
    (experiment) => experiment.slug !== liveExperiment?.slug
  )

  return (
    <main className="min-h-svh bg-lab-bg text-lab-text lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
      <LabSidebar activeSlug={liveExperiment?.slug} />

      <div className="min-w-0 bg-lab-surface">
        <header className="flex flex-col gap-4 border-b border-lab-line px-4 py-5 sm:flex-row sm:items-end sm:justify-between lg:px-6 lg:py-6">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-lab-dim uppercase">
              browser-native creative coding
            </p>
            <h2 className="mt-2 font-serif text-[2.4rem] leading-[0.95] tracking-normal text-lab-text sm:text-[3.35rem]">
              motion as interface
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-lab-muted">
            small visual systems first, reusable open-source packages after the
            interaction earns it
          </p>
        </header>

        <section className="grid min-h-[calc(100svh-105px)] gap-px bg-lab-line lg:grid-cols-[minmax(0,1fr)_304px]">
          <div
            aria-hidden="true"
            data-testid="empty-stage"
            className="min-h-[44svh] bg-lab-bg sm:min-h-[68svh] lg:min-h-0"
          />

          <aside className="flex min-h-0 flex-col bg-lab-panel p-4 lg:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[11px] tracking-[0.2em] text-lab-dim uppercase">
                selected
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-lab-text">
                {liveExperiment?.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-lab-muted">
                {liveExperiment?.summary}
              </p>
            </div>

            <dl className="mt-8 grid gap-px overflow-hidden rounded-sm bg-lab-line">
              <Fact label="status" value={liveExperiment?.status ?? "live"} />
              <Fact label="input" value={liveExperiment?.input ?? "webcam"} />
              <Fact
                label="stack"
                value={liveExperiment?.stack.join(" / ") ?? "MediaPipe"}
              />
            </dl>

            <div className="mt-8">
              <p className="font-mono text-[11px] tracking-[0.2em] text-lab-dim uppercase">
                next
              </p>
              <div className="mt-3 space-y-1">
                {queuedExperiments.map((experiment) => (
                  <Link
                    key={experiment.slug}
                    href={experiment.href}
                    className="block rounded-sm px-2 py-2 text-sm text-lab-muted transition hover:bg-lab-elevated hover:text-lab-text"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-lab-text">
                        {experiment.title}
                      </span>
                      <span className="font-mono text-[10px] text-lab-dim uppercase">
                        {experiment.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href={liveExperiment?.href ?? "/experiments"}
              className={buttonVariants({
                variant: "outline",
                className:
                  "mt-auto w-full border-lab-text bg-lab-bg text-lab-text hover:bg-lab-elevated",
              })}
            >
              open
            </Link>
          </aside>
        </section>
      </div>
    </main>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 bg-lab-surface px-3 py-3 text-sm">
      <dt className="font-mono text-[10px] tracking-[0.18em] text-lab-dim uppercase">
        {label}
      </dt>
      <dd className="min-w-0 text-lab-muted">{value}</dd>
    </div>
  )
}
