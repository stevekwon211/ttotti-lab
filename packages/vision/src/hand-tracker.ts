import type {
  Category,
  HandLandmarker,
  HandLandmarkerResult,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision"
import {
  calculatePinchDistance,
  selectFingerTips,
} from "@ttotti/effects"

import type {
  HandFrame,
  HandLandmark,
  HandTracker,
  HandTrackerOptions,
  TrackedHand,
} from "./types"

const DEFAULT_WASM_BASE_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"

const DEFAULT_HAND_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"

export async function createHandTracker(
  options: HandTrackerOptions = {}
): Promise<HandTracker> {
  const { FilesetResolver, HandLandmarker } = await import(
    "@mediapipe/tasks-vision"
  )
  const vision = await FilesetResolver.forVisionTasks(
    options.wasmBaseUrl ?? DEFAULT_WASM_BASE_URL
  )
  const landmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: options.modelAssetUrl ?? DEFAULT_HAND_MODEL_URL,
      delegate: options.delegate ?? "GPU",
    },
    runningMode: "VIDEO",
    numHands: options.numHands ?? 1,
    minHandDetectionConfidence: options.minHandDetectionConfidence ?? 0.5,
    minHandPresenceConfidence: options.minHandPresenceConfidence ?? 0.5,
    minTrackingConfidence: options.minTrackingConfidence ?? 0.5,
  })

  return createTrackerHandle(landmarker)
}

function createTrackerHandle(landmarker: HandLandmarker): HandTracker {
  return {
    detectForVideo(video, timestampMs) {
      return handResultToFrame(
        landmarker.detectForVideo(video, timestampMs),
        timestampMs
      )
    },
    setOptions(options) {
      return landmarker.setOptions(options)
    },
    close() {
      landmarker.close()
    },
  }
}

export function handResultToFrame(
  result: HandLandmarkerResult,
  timestampMs: number
): HandFrame {
  const hands: TrackedHand[] = result.landmarks.map((landmarks, handIndex) => {
    const converted = landmarks.map(toHandLandmark)
    const category = firstCategory(result.handedness[handIndex])

    return {
      landmarks: converted,
      fingertips: selectFingerTips(converted),
      handedness: category?.categoryName || "unknown",
      score: category?.score,
      pinchDistance: calculatePinchDistance(converted),
    }
  })

  return {
    timestampMs,
    hands,
  }
}

function toHandLandmark(landmark: NormalizedLandmark): HandLandmark {
  return {
    x: landmark.x,
    y: landmark.y,
    z: landmark.z,
    visibility: landmark.visibility,
  }
}

function firstCategory(categories: Category[] | undefined) {
  return categories?.[0]
}
