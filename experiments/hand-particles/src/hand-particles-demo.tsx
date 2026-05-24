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
import { Slider } from "@ttotti/ui/components/slider"
import { Switch } from "@ttotti/ui/components/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@ttotti/ui/components/tooltip"
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

const PARTICLE_BLUE = "cornflowerblue"
const PARTICLE_HOT = "lightskyblue"

export function HandParticlesDemo() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const stageRef = React.useRef<HTMLDivElement | null>(null)
  const trackerRef = React.useRef<HandTracker | null>(null)
  const rafRef = React.useRef<number | null>(null)
  const cameraRef = React.useRef<CameraState>({ status: "idle" })
  const settingsRef = React.useRef(initialSettings)

  const [settings, setSettings] = React.useState(initialSettings)
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
    settingsRef.current = settings
    void trackerRef.current?.setOptions({ numHands: settings.maxHands })
  }, [settings])

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

    const trackerResult = await createTrackerWithFallback(settings.maxHands)

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
    <section className="grid min-h-svh gap-px bg-lab-line text-lab-text lg:grid-cols-[minmax(0,1fr)_320px]">
      <div
        ref={stageRef}
        data-testid="hand-stage"
        className="relative min-h-[44svh] overflow-hidden bg-lab-bg sm:min-h-[68svh] lg:min-h-0"
      >
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            status === "running" ? "opacity-45" : "opacity-0"
          } ${settings.mirror ? "scale-x-[-1]" : ""}`}
          aria-label="webcam preview"
        />
        <ParticleCanvas points={trail} size={stageSize} />
        {settings.showLandmarks ? (
          <LandmarkOverlay landmarks={landmarks} />
        ) : null}

        <div className="absolute right-4 bottom-4 left-4 grid gap-px overflow-hidden rounded-sm bg-lab-line opacity-75 sm:grid-cols-4 lg:right-6 lg:bottom-6 lg:left-6">
          <Metric label="hands" value={String(metrics.hands)} />
          <Metric label="fps" value={String(metrics.fps)} />
          <Metric label="pinch" value={formatPinch(metrics.pinch)} />
          <Metric label="delegate" value={metrics.delegate} />
        </div>
      </div>

      <aside className="flex min-h-0 flex-col bg-lab-panel p-4 lg:p-5">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-lab-dim uppercase">
                ttotti lab / 001
              </p>
              <h1 className="mt-3 font-serif text-[2.25rem] leading-[0.95] tracking-normal text-lab-text">
                hand particles
              </h1>
            </div>
            <span className="rounded-sm bg-lab-blue px-2 py-1 font-mono text-[10px] font-medium tracking-[0.14em] text-lab-bg uppercase">
              {status === "running" ? "live" : "idle"}
            </span>
          </div>
          <p className="mt-7 font-mono text-[11px] tracking-[0.2em] text-lab-dim uppercase">
            controls
          </p>
          <p className="mt-3 text-sm leading-6 text-lab-muted">
            fingertip trails from MediaPipe Hand Landmarker in video mode
          </p>
        </div>

        <div className="mt-6 grid grid-cols-[1fr_auto] gap-2">
          <Button
            type="button"
            onClick={startDemo}
            disabled={status === "loading" || status === "running"}
            className="bg-lab-blue text-lab-bg hover:bg-lab-blue/90"
          >
            {status === "loading" ? "loading" : "start camera"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={stopDemo}
            className="border-lab-line bg-lab-surface text-lab-muted hover:bg-lab-elevated hover:text-lab-text"
          >
            stop
          </Button>
        </div>

        <p className="mt-3 rounded-sm bg-lab-surface px-3 py-2 font-mono text-[11px] leading-5 text-lab-muted">
          {message}
        </p>

        <div className="mt-6 space-y-3">
          <ControlRow label="mirror">
            <Switch
              checked={settings.mirror}
              onCheckedChange={(mirror) =>
                setSettings((current) => ({ ...current, mirror }))
              }
            />
          </ControlRow>
          <ControlRow label="landmarks">
            <Switch
              checked={settings.showLandmarks}
              onCheckedChange={(showLandmarks) =>
                setSettings((current) => ({ ...current, showLandmarks }))
              }
            />
          </ControlRow>
          <SliderControl
            label="effect strength"
            value={settings.strength}
            min={0.2}
            max={1.4}
            step={0.05}
            onChange={(strength) =>
              setSettings((current) => ({ ...current, strength }))
            }
          />
          <SliderControl
            label="smoothing"
            value={settings.smoothing}
            min={0.05}
            max={0.85}
            step={0.05}
            onChange={(smoothing) =>
              setSettings((current) => ({ ...current, smoothing }))
            }
          />
          <SliderControl
            label="max hands"
            value={settings.maxHands}
            min={1}
            max={2}
            step={1}
            onChange={(maxHands) =>
              setSettings((current) => ({ ...current, maxHands }))
            }
          />
        </div>

        <div className="mt-auto pt-6 text-xs leading-5 text-lab-dim">
          pinch your thumb and index finger to push particle intensity
        </div>
      </aside>
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
              color={point.energy > 0.9 ? PARTICLE_HOT : PARTICLE_BLUE}
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
            stroke="var(--lab-blue)"
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
          fill={index === 4 || index === 8 ? "var(--lab-blue)" : "white"}
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

function ControlRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-sm bg-lab-surface px-3 py-2">
      <span className="text-sm text-lab-muted">{label}</span>
      {children}
    </div>
  )
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <div className="rounded-sm bg-lab-surface px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm text-lab-muted">{label}</span>
        <Tooltip>
          <TooltipTrigger>
            <span className="font-mono text-xs text-lab-dim">
              {Number.isInteger(value) ? value : value.toFixed(2)}
            </span>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(nextValue) => {
          const first = Array.isArray(nextValue) ? nextValue[0] : nextValue

          if (first !== undefined) {
            onChange(first)
          }
        }}
      />
    </div>
  )
}

function formatPinch(value: number | undefined) {
  return value === undefined ? "--" : value.toFixed(3)
}
