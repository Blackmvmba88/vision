import { useEffect, useState, type RefObject } from "react";
import type { Detection, DetectorStatus } from "./types";

export function useObjectDetector(videoRef: RefObject<HTMLVideoElement | null>) {
  const [status, setStatus] = useState<DetectorStatus>("loading");
  const [predictions, setPredictions] = useState<Detection[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let model: any = null;
    let intervalId: number | undefined;

    async function loadModel() {
      try {
        setStatus("loading");
        await import("@tensorflow/tfjs");
        const cocoSsd = await import("@tensorflow-models/coco-ssd");
        model = await cocoSsd.load();
        if (!mounted) return;
        setStatus("ready");

        intervalId = window.setInterval(async () => {
          if (!mounted || !model || !videoRef.current) return;
          if (videoRef.current.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) return;

          try {
            const results = await model.detect(videoRef.current);
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

  return { status, predictions, error };
}
