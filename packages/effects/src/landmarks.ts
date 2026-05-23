export type LandmarkPoint = {
  x: number
  y: number
  z?: number
  visibility?: number
}

export type ViewportSize = {
  width: number
  height: number
}

export type ViewportLandmark = LandmarkPoint & {
  normalizedX: number
  normalizedY: number
}

export const FINGER_TIP_INDICES = [4, 8, 12, 16, 20] as const

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function clamp01(value: number) {
  return clamp(value, 0, 1)
}

export function lerp(a: number, b: number, alpha: number) {
  return a + (b - a) * clamp01(alpha)
}

export function mapLandmarksToViewport(
  landmarks: readonly LandmarkPoint[],
  viewport: ViewportSize,
  options: { mirror?: boolean } = {}
): ViewportLandmark[] {
  return landmarks.map((landmark) => {
    const normalizedX = options.mirror ? 1 - landmark.x : landmark.x
    const normalizedY = landmark.y

    return {
      ...landmark,
      x: normalizedX * viewport.width,
      y: normalizedY * viewport.height,
      normalizedX,
      normalizedY,
    }
  })
}

export function smoothLandmarks<T extends LandmarkPoint>(
  current: readonly T[],
  previous: readonly T[] | undefined,
  alpha = 0.35
): T[] {
  if (!previous || previous.length !== current.length) {
    return current.map((landmark) => ({ ...landmark }))
  }

  return current.map((landmark, index) => {
    const last = previous[index]

    if (!last) {
      return { ...landmark }
    }

    return {
      ...landmark,
      x: lerp(last.x, landmark.x, alpha),
      y: lerp(last.y, landmark.y, alpha),
      z:
        landmark.z === undefined || last.z === undefined
          ? landmark.z
          : lerp(last.z, landmark.z, alpha),
      visibility:
        landmark.visibility === undefined || last.visibility === undefined
          ? landmark.visibility
          : lerp(last.visibility, landmark.visibility, alpha),
    }
  })
}

export function selectFingerTips<T extends LandmarkPoint>(
  landmarks: readonly T[]
): T[] {
  return FINGER_TIP_INDICES.flatMap((index) => {
    const landmark = landmarks[index]

    return landmark ? [landmark] : []
  })
}

export function distance2D(a: LandmarkPoint, b: LandmarkPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function calculatePinchDistance(landmarks: readonly LandmarkPoint[]) {
  const thumbTip = landmarks[4]
  const indexTip = landmarks[8]

  if (!thumbTip || !indexTip) {
    return undefined
  }

  return distance2D(thumbTip, indexTip)
}
