import { describe, expect, it } from "vitest"

import { handResultToFrame } from "./hand-tracker"

describe("handResultToFrame", () => {
  it("normalizes MediaPipe output into a compact frame", () => {
    const landmarks = Array.from({ length: 21 }, (_, index) => ({
      x: index / 20,
      y: index / 40,
      z: 0,
      visibility: 1,
    }))

    landmarks[4] = { x: 0.1, y: 0.1, z: 0, visibility: 1 }
    landmarks[8] = { x: 0.2, y: 0.1, z: 0, visibility: 1 }

    const frame = handResultToFrame(
      {
        landmarks: [landmarks],
        worldLandmarks: [],
        handednesses: [],
        handedness: [
          [
            {
              categoryName: "Right",
              displayName: "Right",
              index: 0,
              score: 0.94,
            },
          ],
        ],
      },
      1200
    )

    expect(frame.timestampMs).toBe(1200)
    expect(frame.hands[0]?.landmarks).toHaveLength(21)
    expect(frame.hands[0]?.fingertips).toHaveLength(5)
    expect(frame.hands[0]?.handedness).toBe("Right")
    expect(frame.hands[0]?.pinchDistance).toBeCloseTo(0.1)
  })
})
