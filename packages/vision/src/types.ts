export type HandLandmark = {
  x: number
  y: number
  z: number
  visibility?: number
}

export type TrackedHand = {
  landmarks: HandLandmark[]
  fingertips: HandLandmark[]
  handedness: string
  score?: number
  pinchDistance?: number
}

export type HandFrame = {
  timestampMs: number
  hands: TrackedHand[]
}

export type HandTrackerOptions = {
  numHands?: number
  delegate?: "CPU" | "GPU"
  minHandDetectionConfidence?: number
  minHandPresenceConfidence?: number
  minTrackingConfidence?: number
  wasmBaseUrl?: string
  modelAssetUrl?: string
}

export type HandTracker = {
  detectForVideo(video: HTMLVideoElement, timestampMs: number): HandFrame
  setOptions(options: Pick<HandTrackerOptions, "numHands">): Promise<void>
  close(): void
}

export type CameraState =
  | { status: "idle" }
  | { status: "unsupported"; reason: string }
  | { status: "denied"; reason: string }
  | {
      status: "running"
      stream: MediaStream
      width: number
      height: number
      stop: () => void
    }

export type CameraStreamOptions = {
  video: HTMLVideoElement
  facingMode?: "user" | "environment"
  width?: number
  height?: number
}
