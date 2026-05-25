"use client"

import { Canvas } from "@react-three/fiber"
import {
  ageTrailPoints,
  createTrailPoint,
  normalizeTrailEnergy,
  selectFingerTips,
  type TrailPoint,
  type ViewportLandmark,
} from "@ttotti/effects"
import { Button } from "@ttotti/ui/components/button"
import {
  createHandTracker,
  mapLandmarksToViewport,
  smoothLandmarks,
  startCameraStream,
  type CameraState,
  type HandLandmark,
  type HandTracker,
} from "@ttotti/vision"
import * as React from "react"

type DemoSettings = {
  mirror: boolean
  showLandmarks: boolean
  strength: number
  smoothing: number
  maxHands: number
}

type DemoMetrics = {
  hands: number
  fps: number
  pinch?: number
  delegate: "GPU" | "CPU" | "idle"
}

const initialSettings: DemoSettings = {
  mirror: true,
  showLandmarks: true,
  strength: 0.78,
  smoothing: 0.42,
  maxHands: 1,
}

const HAND_CONNECTIONS: readonly [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [5, 9],
  [9, 13],
  [13, 17],
]

const PARTICLE_INK = "black"
const PARTICLE_SOFT = "dimgray"

export function HandParticlesDemo() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const stageRef = React.useRef<HTMLDivElement | null>(null)
  const trackerRef = React.useRef<HandTracker | null>(null)
  const rafRef = React.useRef<number | null>(null)
  const cameraRef = React.useRef<CameraState>({ status: "idle" })
  const settingsRef = React.useRef(initialSettings)

  const [status, setStatus] = React.useState<
    "idle" | "loading" | "running" | "error"
  >("idle")
  const [message, setMessage] = React.useState(
    "camera is off. start when you are ready"
  )
  const [landmarks, setLandmarks] = React.useState<ViewportLandmark[]>([])
  const [trail, setTrail] = React.useState<TrailPoint[]>([])
  const [stageSize, setStageSize] = React.useState({ width: 1, height: 1 })
  const [metrics, setMetrics] = React.useState<DemoMetrics>({
    hands: 0,
    fps: 0,
    delegate: "idle",
  })

  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }

      trackerRef.current?.close()

      if (cameraRef.current.status === "running") {
        cameraRef.current.stop()
      }
    }
  }, [])

  async function startDemo() {
    if (!videoRef.current || status === "loading" || status === "running") {
      return
    }

    setStatus("loading")
    setMessage("loading hand landmarker")

    const trackerResult = await createTrackerWithFallback(
      settingsRef.current.maxHands
    )

    if (!trackerResult) {
      setStatus("error")
      setMessage("could not load MediaPipe hand model")
      return
    }

    trackerRef.current = trackerResult.tracker
    setMetrics((current) => ({ ...current, delegate: trackerResult.delegate }))
    setMessage("waiting for camera permission")

    const camera = await startCameraStream({
      video: videoRef.current,
      facingMode: "user",
    })

    cameraRef.current = camera

    if (camera.status !== "running") {
      trackerResult.tracker.close()
      trackerRef.current = null
      setStatus("error")
      setMessage("reason" in camera ? camera.reason : "camera did not start")
      return
    }

    setStatus("running")
    setMessage("tracking fingertips")
    runLoop()
  }

  function stopDemo() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    trackerRef.current?.close()
    trackerRef.current = null

    if (cameraRef.current.status === "running") {
      cameraRef.current.stop()
    }

    cameraRef.current = { status: "idle" }
    setStatus("idle")
    setMessage("camera is off. start when you are ready")
    setLandmarks([])
    setTrail([])
    setMetrics({ hands: 0, fps: 0, delegate: "idle" })
  }

  function runLoop() {
    const video = videoRef.current
    const stage = stageRef.current
    const tracker = trackerRef.current

    if (!video || !stage || !tracker) {
      return
    }

    let previous: HandLandmark[] | undefined
    let lastFrameAt = performance.now()

    const tick = () => {
      const now = performance.now()
      const deltaMs = now - lastFrameAt
      const bounds = stage.getBoundingClientRect()
      const frame = tracker.detectForVideo(video, now)
      const firstHand = frame.hands[0]
      const currentSettings = settingsRef.current
      const nextStageSize = {
        width: Math.max(bounds.width, 1),
        height: Math.max(bounds.height, 1),
      }

      setStageSize((current) =>
        current.width === nextStageSize.width &&
        current.height === nextStageSize.height
          ? current
          : nextStageSize
      )

      if (firstHand) {
        const smoothed = smoothLandmarks(
          firstHand.landmarks,
          previous,
          currentSettings.smoothing
        )
        previous = smoothed

        const mapped = mapLandmarksToViewport(
          smoothed,
          { width: bounds.width, height: bounds.height },
          { mirror: currentSettings.mirror }
        )
        const energy =
          normalizeTrailEnergy(firstHand.pinchDistance) *
          currentSettings.strength
        const additions = selectFingerTips(mapped).map((landmark, index) =>
          createTrailPoint(landmark, {
            id: `finger-${index}`,
            now,
            energy,
            life: 750 + currentSettings.strength * 650,
          })
        )

        setLandmarks(mapped)
        setTrail((points) =>
          ageTrailPoints([...points, ...additions], deltaMs).slice(-320)
        )
        setMetrics((current) => ({
          hands: frame.hands.length,
          fps: deltaMs > 0 ? Math.round(1000 / deltaMs) : 0,
          pinch: firstHand.pinchDistance,
          delegate: current.delegate,
        }))
      } else {
        previous = undefined
        setLandmarks([])
        setTrail((points) => ageTrailPoints(points, deltaMs))
        setMetrics((current) => ({
          ...current,
          hands: 0,
          fps: deltaMs > 0 ? Math.round(1000 / deltaMs) : 0,
          pinch: undefined,
        }))
      }

      lastFrameAt = now
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  return (
    <section className="min-h-[calc(100svh-97px)] bg-lab-bg text-lab-text lg:h-full lg:min-h-0 lg:overflow-hidden">
      <div
        ref={stageRef}
        data-testid="hand-stage"
        className="relative h-full min-h-[calc(100svh-97px)] overflow-hidden bg-lab-bg lg:min-h-0"
      >
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            status === "running" ? "opacity-45" : "opacity-0"
          } ${initialSettings.mirror ? "scale-x-[-1]" : ""}`}
          aria-label="webcam preview"
        />
        <ParticleCanvas points={trail} size={stageSize} />
        {initialSettings.showLandmarks && landmarks.length > 0 ? (
          <LandmarkOverlay landmarks={landmarks} />
        ) : null}

        <div className="absolute top-3 left-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2 lg:top-5 lg:left-5">
          <Button
            type="button"
            variant="outline"
            onClick={startDemo}
            disabled={status === "loading" || status === "running"}
            className="h-9 rounded-sm border-lab-text bg-lab-bg px-3 text-sm text-lab-text hover:bg-lab-elevated focus-visible:ring-lab-ink/30"
          >
            {status === "loading" ? "loading" : "start camera"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={stopDemo}
            className="h-9 rounded-sm border-lab-line bg-lab-bg px-3 text-sm text-lab-muted hover:border-lab-text hover:bg-lab-elevated hover:text-lab-text focus-visible:ring-lab-ink/30"
          >
            stop
          </Button>
          <p className="rounded-sm border border-lab-line bg-lab-bg px-3 py-2 font-mono text-[11px] leading-5 text-lab-muted">
            {message}
          </p>
        </div>

        {status === "running" ? (
          <div className="absolute right-3 bottom-3 left-3 grid gap-px overflow-hidden rounded-sm bg-lab-line/90 sm:grid-cols-4 lg:right-6 lg:bottom-6 lg:left-6">
            <Metric label="hands" value={String(metrics.hands)} />
            <Metric label="fps" value={String(metrics.fps)} />
            <Metric label="pinch" value={formatPinch(metrics.pinch)} />
            <Metric label="delegate" value={metrics.delegate} />
          </div>
        ) : null}
      </div>
    </section>
  )
}

async function createTrackerWithFallback(numHands: number) {
  try {
    return {
      tracker: await createHandTracker({ numHands, delegate: "GPU" }),
      delegate: "GPU" as const,
    }
  } catch {
    try {
      return {
        tracker: await createHandTracker({ numHands, delegate: "CPU" }),
        delegate: "CPU" as const,
      }
    } catch {
      return undefined
    }
  }
}

function ParticleCanvas({
  points,
  size,
}: {
  points: readonly TrailPoint[]
  size: { width: number; height: number }
}) {
  return (
    <Canvas
      className="absolute inset-0"
      orthographic
      camera={{ position: [0, 0, 10], zoom: 74 }}
    >
      <ambientLight intensity={0.6} />
      <group>
        {points.map((point) => (
          <mesh
            key={point.id}
            position={[
              (point.x / size.width - 0.5) * 12,
              -(point.y / size.height - 0.5) * 7,
              point.z,
            ]}
          >
            <sphereGeometry args={[0.035 + point.energy * 0.035, 12, 12]} />
            <meshBasicMaterial
              color={point.energy > 0.9 ? PARTICLE_INK : PARTICLE_SOFT}
              transparent
              opacity={Math.max(0, 1 - point.age / point.life)}
            />
          </mesh>
        ))}
      </group>
    </Canvas>
  )
}

function LandmarkOverlay({
  landmarks,
}: {
  landmarks: readonly ViewportLandmark[]
}) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full">
      {HAND_CONNECTIONS.map(([from, to]) => {
        const a = landmarks[from]
        const b = landmarks[to]

        if (!a || !b) {
          return null
        }

        return (
          <line
            key={`${from}-${to}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="black"
            opacity="0.56"
            strokeWidth="1.5"
          />
        )
      })}
      {landmarks.map((landmark, index) => (
        <circle
          key={index}
          cx={landmark.x}
          cy={landmark.y}
          r={index === 4 || index === 8 ? 5 : 3}
          fill={index === 4 || index === 8 ? "black" : "white"}
          opacity="0.86"
        />
      ))}
    </svg>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-lab-surface px-3 py-3">
      <div className="font-mono text-[10px] tracking-[0.16em] text-lab-dim uppercase">
        {label}
      </div>
      <div className="mt-2 font-mono text-xs text-lab-muted">{value}</div>
    </div>
  )
}

function formatPinch(value: number | undefined) {
  return value === undefined ? "--" : value.toFixed(3)
}
