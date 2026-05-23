import { experiments } from "@/lib/experiments"
import { Badge } from "@ttotti/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ttotti/ui/components/card"
import Link from "next/link"

export default function ExperimentsPage() {
  return (
    <main className="min-h-svh bg-background p-4 text-foreground">
      <div className="mx-auto grid max-w-6xl gap-4">
        <header className="flex flex-col gap-2 rounded-lg border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              ttotti lab
            </p>
            <h1 className="mt-2 text-2xl font-medium">experiments</h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            each entry starts as a focused demo, then graduates into reusable
            packages when the interaction feels worth keeping
          </p>
        </header>

        <section className="grid gap-3 md:grid-cols-2">
          {experiments.map((experiment) => (
            <Card key={experiment.slug}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{experiment.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {experiment.input}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      experiment.status === "live" ? "default" : "secondary"
                    }
                  >
                    {experiment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {experiment.summary}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {experiment.stack.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
                <Link
                  href={experiment.href}
                  className="mt-5 inline-flex text-sm font-medium underline-offset-4 hover:underline"
                >
                  open
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  )
}
