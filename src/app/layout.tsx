import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AETHER | AI Music Generation",
  description: "Create incredible music with AI. AETHER is the next generation of AI-powered music creation.",
  keywords: ["aether", "ai music", "music generation", "ai", "suno", "music creator", "artificial intelligence"],
  creator: "nommand",
  authors: [{ name: "nommand" }],
  openGraph: {
    title: "AETHER | AI Music Generation",
    description: "Create incredible music with AI. AETHER is the next generation of AI-powered music creation.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AETHER | AI Music Generation",
    description: "Create incredible music with AI. AETHER is the next generation of AI-powered music creation.",
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
        className={`${inter.variable} font-sans antialiased overflow-y-scroll`}
        suppressHydrationWarning
      >
        {/* Background gradient orbs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-pink-500/15 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Main app structure */}
        <div className="min-h-screen flex flex-col">
          <Header />

          {/* Add padding-top to account for fixed header */}
          <main className="flex-1 pt-16">
            <div className="flex flex-col items-center w-full">
              {children}
            </div>
          </main>

          <Footer />
        </div>

        <Analytics />
      </body>
    </html>
  );
}
