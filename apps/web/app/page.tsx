import { experiments } from "@/lib/experiments"
import { Badge } from "@ttotti/ui/components/badge"
import { buttonVariants } from "@ttotti/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ttotti/ui/components/card"
import { Separator } from "@ttotti/ui/components/separator"
import { ArrowUpRight, GitFork, Sparkles } from "lucide-react"
import Link from "next/link"

export default function Page() {
  const liveExperiment = experiments.find((experiment) => experiment.status === "live")
  const queuedExperiments = experiments.filter(
    (experiment) => experiment.status !== "live"
  )

  return (
    <main className="min-h-svh bg-background p-3 text-foreground">
      <div className="grid min-h-[calc(100svh-1.5rem)] gap-3 lg:grid-cols-[minmax(240px,320px)_minmax(0,1fr)_minmax(260px,360px)]">
        <section className="flex flex-col rounded-lg border bg-card p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              browser-native creative coding
            </p>
            <h1 className="mt-3 text-3xl font-medium tracking-normal">
              ttotti lab
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              motion, vision, WebGL, and media art experiments that can become
              small open-source tools
            </p>
          </div>

          <Separator className="my-4" />

          <div className="flex flex-wrap gap-2">
            {["MediaPipe", "Three.js", "VFX", "webcam", "shaders"].map(
              (tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              )
            )}
          </div>

          <div className="mt-auto grid gap-2 pt-5">
            <Link
              href="/experiments/hand-particles"
              className={buttonVariants({ className: "gap-1.5" })}
            >
              open hand particles
              <ArrowUpRight />
            </Link>
            <Link
              href="https://github.com/stevekwon211/ttotti-lab"
              className={buttonVariants({
                variant: "outline",
                className: "gap-1.5",
              })}
            >
              <GitFork />
              source
            </Link>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-lg border bg-[#070809]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(109,255,216,0.28),transparent_24%),radial-gradient(circle_at_74%_64%,rgba(255,126,99,0.2),transparent_32%),linear-gradient(145deg,rgba(255,255,255,0.08),transparent_42%)]" />
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="relative flex min-h-[62svh] flex-col justify-between p-4 lg:min-h-full">
            <div className="flex items-center justify-between gap-3 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                  featured experiment
                </p>
                <h2 className="mt-2 text-2xl font-medium">
                  {liveExperiment?.title}
                </h2>
              </div>
              <Badge className="bg-white text-black">live</Badge>
            </div>

            <PreviewField />

            <div className="grid gap-2 text-sm text-white/72 sm:grid-cols-3">
              <PreviewMetric label="input" value="webcam" />
              <PreviewMetric label="model" value="hand landmarks" />
              <PreviewMetric label="output" value="particle trails" />
            </div>
          </div>
        </section>

        <section className="grid gap-3">
          <Card>
            <CardHeader>
              <CardTitle>experiments</CardTitle>
              <CardDescription>
                small demos first, reusable packages after the pattern is clear
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {experiments.map((experiment) => (
                <Link
                  key={experiment.slug}
                  href={experiment.href}
                  className="rounded-md border p-3 transition hover:bg-muted"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {experiment.title}
                    </span>
                    <Badge
                      variant={
                        experiment.status === "live" ? "default" : "secondary"
                      }
                    >
                      {experiment.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {experiment.summary}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>next queue</CardTitle>
              <CardDescription>
                the lab stays broad: MediaPipe first, spatial media next
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {queuedExperiments.map((experiment) => (
                <div key={experiment.slug} className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 size-4 text-[#ff7a5c]" />
                  <span>{experiment.summary}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}

function PreviewField() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {Array.from({ length: 18 }, (_, index) => (
        <div
          key={index}
          className="absolute size-3 rounded-full bg-[#77ffd7] shadow-[0_0_28px_rgba(119,255,215,0.72)]"
          style={{
            left: `${12 + ((index * 19) % 72)}%`,
            top: `${18 + ((index * 31) % 62)}%`,
            opacity: 0.24 + (index % 5) * 0.13,
            transform: `scale(${0.8 + (index % 4) * 0.28})`,
          }}
        />
      ))}
      <div className="absolute left-[20%] top-[22%] h-[54%] w-[48%] rounded-[48%] border border-white/20 bg-white/[0.03]" />
      <div className="absolute left-[32%] top-[34%] h-[32%] w-[36%] rounded-full border border-[#ff7a5c]/50" />
    </div>
  )
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/28 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">
        {label}
      </div>
      <div className="mt-1 font-mono text-xs">{value}</div>
    </div>
  )
}
