import { describe, expect, it } from "vitest"

import { handParticlesManifest } from "./manifest"

describe("hand particles manifest", () => {
  it("describes the first live MediaPipe experiment", () => {
    expect(handParticlesManifest.slug).toBe("hand-particles")
    expect(handParticlesManifest.stack).toContain("MediaPipe")
    expect(handParticlesManifest.status).toBe("live")
  })
})
