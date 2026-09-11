import ChirpyPreview from "./preview";

export default function ThreeDPage() {
  const base = process.env.BASE_PATH?.replace(/\/$/, "") ?? "";
  return <ChirpyPreview modelUrl={`${base}/models/chirpy-machine-v1.glb`} cheerImageUrl={`${base}/images/chirpy-cheer-v2.png`} />;
}
