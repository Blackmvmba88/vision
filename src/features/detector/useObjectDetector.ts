import { useEffect, useState, type RefObject } from "react";
import type { Detection, DetectorStatus } from "./types";

const MOTION_WIDTH = 160;
const MOTION_HEIGHT = 120;
const MOTION_THRESHOLD = 0.02;
const PIXEL_DIFF_TOLERANCE = 30;

function hasMotion(previous: Uint8ClampedArray, current: Uint8ClampedArray) {
  let changedPixels = 0;
  const length = current.length;

  for (let i = 0; i < length; i += 1) {
    if (Math.abs(current[i] - previous[i]) > PIXEL_DIFF_TOLERANCE) {
      changedPixels += 1;
    }
  }

  return changedPixels / (MOTION_WIDTH * MOTION_HEIGHT) > MOTION_THRESHOLD;
}

export function useObjectDetector(videoRef: RefObject<HTMLVideoElement | null>) {
  const [status, setStatus] = useState<DetectorStatus>("loading");
  const [predictions, setPredictions] = useState<Detection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [motionDetected, setMotionDetected] = useState(false);

  useEffect(() => {
    let mounted = true;
    let model: any = null;
    let intervalId: number | undefined;
    let prevFrame: Uint8ClampedArray | null = null;

    async function loadModel() {
      try {
        setStatus("loading");
        await import("@tensorflow/tfjs");
        const cocoSsd = await import("@tensorflow-models/coco-ssd");
        model = await cocoSsd.load();
        if (!mounted) return;
        setStatus("ready");

        const motionCanvas = document.createElement("canvas");
        motionCanvas.width = MOTION_WIDTH;
        motionCanvas.height = MOTION_HEIGHT;
        const motionCtx = motionCanvas.getContext("2d");

        intervalId = window.setInterval(async () => {
          const video = videoRef.current;
          if (!mounted || !model || !video || !motionCtx) return;
          if (video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) return;

          motionCtx.drawImage(video, 0, 0, MOTION_WIDTH, MOTION_HEIGHT);
          const frame = motionCtx.getImageData(0, 0, MOTION_WIDTH, MOTION_HEIGHT);
          const currentFrame = new Uint8ClampedArray(MOTION_WIDTH * MOTION_HEIGHT);

          for (let i = 0, j = 0; i < frame.data.length; i += 4, j += 1) {
            currentFrame[j] =
              (frame.data[i] * 0.2126 + frame.data[i + 1] * 0.7152 + frame.data[i + 2] * 0.0722) | 0;
          }

          let motion = false;
          if (prevFrame) {
            motion = hasMotion(prevFrame, currentFrame);
          }
          prevFrame = currentFrame;
          setMotionDetected(motion);

          if (!motion) {
            setPredictions([]);
            return;
          }

          try {
            const results = await model.detect(video);
            if (!mounted) return;
            setPredictions(
              results.map((item: any) => ({
                className: item.class,
                score: item.score,
                bbox: item.bbox as [number, number, number, number],
              })),
            );
          } catch (detectionError) {
            if (!mounted) return;
            setError("Unable to run object detection.");
            setStatus("error");
          }
        }, 300);
      } catch (loadError) {
        if (!mounted) return;
        setError("Failed to load the object detection model.");
        setStatus("error");
      }
    }

    loadModel();

    return () => {
      mounted = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [videoRef]);

  return { status, predictions, error, motionDetected };
}
