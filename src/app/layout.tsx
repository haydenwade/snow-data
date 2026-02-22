import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/snow-report/Header";
import AddToHomeScreenPrompt from "@/components/AddToHomeScreenPrompt";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "SNOWD",
  description: "Free snow forecast and ski conditions app powered by SNOTEL and NOAA data. Snowfall totals, snow depth, wind, and lift status. A free OpenSnow alternative. No ads.",
  keywords: [
    "free snow app",
    "free snow forecast",
    "ski conditions",
    "snowfall totals",
    "snow depth",
    "SNOTEL data",
    "NOAA snow forecast",
    "OpenSnow alternative",
    "backcountry snow conditions",
    "ski resort snow report"
  ],
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    apple: [{ url: "/snowd-icon-ios.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "SNOWD",
    description:
      "Free snow forecast and ski conditions app powered by SNOTEL and NOAA data. Snowfall totals, snow depth, wind, and lift status. A free OpenSnow alternative. No ads.",
    images: [
      {
        url: "/og-small.png",
        alt: "SNOWD",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <Header/>
        {children}
        <AddToHomeScreenPrompt />
        <Analytics />
      </body>
    </html>
  );
}
