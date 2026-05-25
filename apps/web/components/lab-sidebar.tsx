import { experiments } from "@/lib/experiments"
import { cn } from "@ttotti/ui/lib/utils"
import Link from "next/link"

type LabSidebarProps = {
  activeSlug?: string
}

export function LabSidebar({ activeSlug }: LabSidebarProps) {
  return (
    <aside className="z-20 flex min-h-0 flex-col border-lab-line bg-lab-bg px-4 py-4 text-lab-text max-lg:sticky max-lg:top-0 max-lg:border-b lg:sticky lg:top-0 lg:h-svh lg:border-r lg:px-5">
      <Link
        href="/"
        className="group block rounded-sm py-1 transition outline-none hover:text-lab-muted focus-visible:ring-2 focus-visible:ring-lab-ink/40"
      >
        <h1 className="font-serif text-[2rem] leading-none tracking-normal text-lab-text">
          ttotti lab
        </h1>
      </Link>

      <nav aria-label="works" className="mt-6 min-h-0 flex-1">
        <div className="relative -mx-4 overflow-hidden px-4 lg:mx-0 lg:px-0">
          <div
            data-testid="work-nav"
            className="scrollbar-none flex snap-x snap-mandatory gap-1 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0"
          >
            {experiments.map((experiment) => {
              const active = experiment.slug === activeSlug

              return (
                <Link
                  key={experiment.slug}
                  href={experiment.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block min-w-[132px] snap-start rounded-sm border border-transparent px-3 py-2 text-sm font-medium transition outline-none focus-visible:border-lab-ink focus-visible:ring-2 focus-visible:ring-lab-ink/30 lg:min-w-0",
                    active
                      ? "border-lab-line bg-lab-ink-faint text-lab-text"
                      : "text-lab-muted hover:border-lab-line hover:bg-lab-elevated hover:text-lab-text"
                  )}
                >
                  {experiment.title}
                </Link>
              )
            })}
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-linear-to-l from-lab-bg to-transparent lg:hidden"
          />
        </div>
      </nav>

      <a
        href="https://github.com/stevekwon211"
        target="_blank"
        rel="noreferrer"
        aria-label="github profile"
        className="mt-5 block rounded-sm px-3 py-2 text-sm text-lab-muted transition outline-none hover:bg-lab-elevated hover:text-lab-text focus-visible:ring-2 focus-visible:ring-lab-ink/30 lg:mt-auto"
      >
        github
      </a>
    </aside>
  )
}
