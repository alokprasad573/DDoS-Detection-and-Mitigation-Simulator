import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const rawUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_BACKEND_APP_URL || "https://sentrix-bay.vercel.app/";

const baseUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
  ? rawUrl
  : `https://${rawUrl}`;

export const viewport: Viewport = {
  themeColor: "#090D16",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "SENTRIX | DDoS Detection & Mitigation Simulator",
    template: "%s | SENTRIX Defense",
  },
  description:
    "Autonomous cloud-native defensive DDoS telemetry, statistical EWMA anomaly velocity analysis, and fail-closed mitigation control plane.",
  applicationName: "SENTRIX",
  authors: [{ name: "SENTRIX Security Engineering Team" }],
  generator: "Next.js",
  keywords: [
    "DDoS Detection",
    "DDoS Mitigation",
    "Cybersecurity",
    "EWMA Velocity",
    "Shannon Entropy",
    "Reverse Proxy Rate Limiting",
    "Caddy Security",
    "Nginx Rate Limiting",
    "DevSecOps",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "SENTRIX",
    title: "SENTRIX — DDoS Detection & Mitigation Simulator",
    description:
      "Enterprise real-time HTTP telemetry streaming, adaptive anomaly detection, and automated WAF defensive enforcement.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SENTRIX — DDoS Detection & Mitigation Simulator",
    description:
      "Enterprise real-time HTTP telemetry streaming, adaptive anomaly detection, and automated WAF defensive enforcement.",
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-canvas-base text-fg-primary antialiased selection:bg-brand-500/20 selection:text-brand-300">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
