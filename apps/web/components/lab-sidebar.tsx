import { experiments } from "@/lib/experiments"
import { buttonVariants } from "@ttotti/ui/components/button"
import { cn } from "@ttotti/ui/lib/utils"
import Link from "next/link"

type LabSidebarProps = {
  activeSlug?: string
}

const tags = ["MediaPipe", "Three.js", "WebGL", "VFX"]

export function LabSidebar({ activeSlug }: LabSidebarProps) {
  return (
    <aside className="flex min-h-0 flex-col border-lab-line bg-lab-bg px-4 py-4 text-lab-text max-lg:border-b lg:sticky lg:top-0 lg:h-svh lg:border-r lg:px-5">
      <Link
        href="/"
        className="group block rounded-sm py-1 transition outline-none focus-visible:ring-2 focus-visible:ring-lab-ink/40"
      >
        <p className="font-mono text-[10px] tracking-[0.2em] text-lab-dim uppercase">
          creative coding
        </p>
        <h1 className="font-serif text-[2rem] leading-none tracking-normal text-lab-text">
          ttotti lab
        </h1>
      </Link>

      <p className="mt-5 hidden max-w-[24ch] text-sm leading-6 text-lab-muted sm:block">
        browser-native experiments for motion, vision, WebGL, and media art
      </p>

      <nav aria-label="experiments" className="mt-5 min-h-0 flex-1 lg:mt-8">
        <div className="mb-2 font-mono text-[10px] tracking-[0.2em] text-lab-dim uppercase">
          works
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
          {experiments.map((experiment, index) => {
            const active = experiment.slug === activeSlug

            return (
              <Link
                key={experiment.slug}
                href={experiment.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group block min-w-[168px] rounded-sm border border-transparent px-3 py-3 transition outline-none focus-visible:ring-2 focus-visible:ring-lab-ink/40 lg:min-w-0",
                  active
                    ? "border-lab-line bg-lab-ink-faint text-lab-text"
                    : "text-lab-muted hover:bg-lab-panel hover:text-lab-text"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] text-lab-dim">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-sm font-medium">
                    {experiment.title}
                  </span>
                </div>
                <p className="mt-2 hidden text-xs leading-5 text-lab-dim group-hover:text-lab-muted lg:line-clamp-2 lg:block">
                  {experiment.summary}
                </p>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="mt-8 hidden lg:block">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-sm bg-lab-panel px-2 py-1 font-mono text-[10px] text-lab-muted"
            >
              {tag}
            </span>
          ))}
        </div>
        <Link
          href="https://github.com/stevekwon211/ttotti-lab"
          className={buttonVariants({
            variant: "outline",
            className:
              "mt-4 w-full border-lab-line bg-lab-surface text-lab-muted hover:bg-lab-panel hover:text-lab-text",
          })}
        >
          source
        </Link>
      </div>
    </aside>
  )
}
