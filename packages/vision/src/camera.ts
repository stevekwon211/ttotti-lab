import type { CameraState, CameraStreamOptions } from "./types"

export async function startCameraStream({
  video,
  facingMode = "user",
  width = 1280,
  height = 720,
}: CameraStreamOptions): Promise<CameraState> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return {
      status: "unsupported",
      reason: "This browser does not expose getUserMedia.",
    }
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode,
        width: { ideal: width },
        height: { ideal: height },
      },
    })

    video.srcObject = stream
    video.muted = true
    video.playsInline = true

    await video.play()

    return {
      status: "running",
      stream,
      width: video.videoWidth || width,
      height: video.videoHeight || height,
      stop: () => {
        stream.getTracks().forEach((track) => track.stop())
        video.srcObject = null
      },
    }
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.message
        : "Camera permission was denied or unavailable."

    return {
      status: "denied",
      reason,
    }
  }
}
