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
    <section className="grid min-h-[calc(100svh-1rem)] gap-3 bg-background p-3 text-foreground lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)_minmax(240px,320px)]">
      <aside className="flex flex-col gap-3 rounded-lg border bg-card p-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            ttotti lab / 001
          </p>
          <h1 className="mt-2 text-2xl font-medium leading-tight">
            hand particles
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            fingertip trails from MediaPipe Hand Landmarker in video mode
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <Metric label="hands" value={String(metrics.hands)} />
          <Metric label="fps" value={String(metrics.fps)} />
          <Metric label="pinch" value={formatPinch(metrics.pinch)} />
          <Metric label="delegate" value={metrics.delegate} />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={startDemo}
            disabled={status === "loading" || status === "running"}
            className="flex-1"
          >
            {status === "loading" ? "loading" : "start camera"}
          </Button>
          <Button type="button" variant="outline" onClick={stopDemo}>
            stop
          </Button>
        </div>

        <p className="rounded-md border bg-muted px-2.5 py-2 text-xs text-muted-foreground">
          {message}
        </p>
      </aside>

      <div
        ref={stageRef}
        className="relative min-h-[58svh] overflow-hidden rounded-lg border bg-[#08090b] lg:min-h-0"
      >
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover opacity-60 ${
            settings.mirror ? "scale-x-[-1]" : ""
          }`}
          aria-label="webcam preview"
        />
        <ParticleCanvas points={trail} size={stageSize} />
        {settings.showLandmarks ? <LandmarkOverlay landmarks={landmarks} /> : null}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(120,255,214,0.22),transparent_26%),radial-gradient(circle_at_80%_70%,rgba(255,121,96,0.14),transparent_30%)]" />
        <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-white/10 bg-black/35 px-2 py-1 text-xs text-white/70 backdrop-blur">
          {status === "running" ? "live" : "preview"}
        </div>
      </div>

      <aside className="flex flex-col gap-3 rounded-lg border bg-card p-3">
        <h2 className="text-sm font-medium">controls</h2>
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
        <div className="mt-auto rounded-md border bg-muted p-3 text-xs text-muted-foreground">
          pinch your thumb and index finger to push the particle intensity
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
              color={point.energy > 0.9 ? "#ff7a5c" : "#77ffd7"}
              transparent
              opacity={Math.max(0, 1 - point.age / point.life)}
            />
          </mesh>
        ))}
      </group>
    </Canvas>
  )
}

function LandmarkOverlay({ landmarks }: { landmarks: readonly ViewportLandmark[] }) {
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
            stroke="rgba(119, 255, 215, 0.56)"
            strokeWidth="2"
          />
        )
      })}
      {landmarks.map((landmark, index) => (
        <circle
          key={index}
          cx={landmark.x}
          cy={landmark.y}
          r={index === 4 || index === 8 ? 5 : 3}
          fill={index === 4 || index === 8 ? "#ff7a5c" : "#f8fafc"}
          opacity="0.86"
        />
      ))}
    </svg>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-sm">{value}</div>
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
    <div className="flex items-center justify-between gap-3 rounded-md border px-2.5 py-2">
      <span className="text-sm">{label}</span>
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
    <div className="rounded-md border px-2.5 py-2">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm">{label}</span>
        <Tooltip>
          <TooltipTrigger>
            <span className="font-mono text-xs text-muted-foreground">
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
