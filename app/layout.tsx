import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IMAGE Marketing — Navrhneme. Vyrobíme. Namontujeme.",
  description:
    "Svetelné reklamy, veľkoplošná tlač, reklamný textil a výstavné systémy. Grafika, výroba a montáž pod jednou strechou v Tvrdošíne.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sk" className={`${archivo.variable} antialiased`}>
      <body className="font-sans text-base leading-[normal]">{children}</body>
    </html>
  );
}
