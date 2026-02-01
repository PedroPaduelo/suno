import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { PlayerProvider } from "./context/PlayerContext";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AETHER OS | AI Music Generation",
  description: "Create incredible music with AI. AETHER OS is the next generation of AI-powered music creation.",
  keywords: ["aether", "ai music", "music generation", "ai", "suno", "music creator", "artificial intelligence"],
  creator: "nommand",
  authors: [{ name: "nommand" }],
  openGraph: {
    title: "AETHER OS | AI Music Generation",
    description: "Create incredible music with AI. AETHER OS is the next generation of AI-powered music creation.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AETHER OS | AI Music Generation",
    description: "Create incredible music with AI. AETHER OS is the next generation of AI-powered music creation.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/aether-icon.svg", type: "image/svg+xml" },
    ],
    apple: "/aether-icon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        <PlayerProvider>
          {/* Header (z-50) */}
          <Header />

          {/* Main content */}
          <main className="min-h-screen">
            {children}
          </main>
        </PlayerProvider>

        <Analytics />
      </body>
    </html>
  );
}
