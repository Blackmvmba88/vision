export type BoundingBox = [number, number, number, number];

export interface Detection {
  className: string;
  score: number;
  bbox: BoundingBox;
}

export type DetectorStatus = "loading" | "ready" | "error";
