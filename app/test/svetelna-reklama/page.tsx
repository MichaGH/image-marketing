import type { Metadata } from "next";
import { LightSignPlayground } from "./LightSignPlayground";

export const metadata: Metadata = {
  title: "Svetelná reklama — prototyp",
  robots: { index: false, follow: false },
};

export default function LightSignTestPage() {
  return <LightSignPlayground />;
}
