import { describe, expect, it } from "vitest"

import { ageTrailPoints, createTrailPoint, normalizeTrailEnergy } from "./trails"

describe("trail points", () => {
  it("ages out old trail points", () => {
    const point = createTrailPoint(
      { x: 10, y: 20, z: -0.2 },
      { id: "finger", now: 12, life: 100 }
    )

    expect(ageTrailPoints([point], 50)).toHaveLength(1)
    expect(ageTrailPoints([point], 100)).toHaveLength(0)
  })

  it("turns tighter pinches into stronger energy", () => {
    expect(normalizeTrailEnergy(0.02)).toBeGreaterThan(normalizeTrailEnergy(0.2))
  })
})
