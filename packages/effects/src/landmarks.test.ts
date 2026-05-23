import { describe, expect, it } from "vitest"

import {
  calculatePinchDistance,
  mapLandmarksToViewport,
  smoothLandmarks,
} from "./landmarks"

describe("landmark mapping", () => {
  it("maps normalized landmarks into viewport pixels", () => {
    const [point] = mapLandmarksToViewport(
      [{ x: 0.25, y: 0.5, z: -0.1 }],
      { width: 800, height: 600 }
    )

    expect(point).toMatchObject({
      x: 200,
      y: 300,
      normalizedX: 0.25,
      normalizedY: 0.5,
      z: -0.1,
    })
  })

  it("mirrors x coordinates for selfie camera previews", () => {
    const [point] = mapLandmarksToViewport(
      [{ x: 0.2, y: 0.5 }],
      { width: 1000, height: 500 },
      { mirror: true }
    )

    expect(point?.x).toBe(800)
    expect(point?.normalizedX).toBe(0.8)
  })
})

describe("landmark smoothing", () => {
  it("interpolates matching landmark sets", () => {
    const [point] = smoothLandmarks(
      [{ x: 1, y: 1, z: 1 }],
      [{ x: 0, y: 0, z: 0 }],
      0.25
    )

    expect(point).toMatchObject({ x: 0.25, y: 0.25, z: 0.25 })
  })
})

describe("pinch distance", () => {
  it("uses thumb and index fingertips", () => {
    const landmarks = Array.from({ length: 21 }, () => ({ x: 0, y: 0 }))
    landmarks[4] = { x: 0, y: 0 }
    landmarks[8] = { x: 3, y: 4 }

    expect(calculatePinchDistance(landmarks)).toBe(5)
  })
})
