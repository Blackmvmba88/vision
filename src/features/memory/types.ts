export type SceneObject = {
  name: string;
  score: number;
};

export type ManualAnnotation = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SceneSnapshot = {
  id: string;
  timestamp: string;
  objects: SceneObject[];
  annotations: ManualAnnotation[];
  source: "browser";
};
