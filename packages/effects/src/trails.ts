import type { LandmarkPoint } from "./landmarks"

export type TrailPoint = {
  id: string
  x: number
  y: number
  z: number
  age: number
  life: number
  energy: number
}

export function createTrailPoint(
  landmark: LandmarkPoint,
  options: {
    id: string
    now: number
    energy?: number
    life?: number
  }
): TrailPoint {
  return {
    id: `${options.id}-${Math.round(options.now)}`,
    x: landmark.x,
    y: landmark.y,
    z: landmark.z ?? 0,
    age: 0,
    life: options.life ?? 900,
    energy: options.energy ?? 1,
  }
}

export function ageTrailPoints(
  points: readonly TrailPoint[],
  deltaMs: number
): TrailPoint[] {
  return points
    .map((point) => ({
      ...point,
      age: point.age + deltaMs,
    }))
    .filter((point) => point.age < point.life)
}

export function normalizeTrailEnergy(pinchDistance: number | undefined) {
  if (pinchDistance === undefined) {
    return 0.55
  }

  const closed = 1 - Math.min(1, pinchDistance / 0.18)

  return 0.35 + closed * 0.9
}
