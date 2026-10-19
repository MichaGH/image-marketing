import type { Metadata } from "next";
import { LedPlayground } from "./LedPlayground";

export const metadata: Metadata = {
  title: "LED matrix — prototyp",
  robots: { index: false, follow: false },
};

export default function TestPage() {
  return <LedPlayground />;
}
