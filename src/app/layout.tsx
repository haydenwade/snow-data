import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/snow-report/Header";

export const metadata: Metadata = {
  title: "SNOWD",
  description: "Trusted snow conditions, forecasts, and historical snowfall — plus lift/terrain status and traffic cams.",
  manifest: "/manifest.json",
  icons: {
    apple: [{ url: "/snowd-icon-ios.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "SNOWD",
    description:
      "Trusted snow conditions, forecasts, and historical snowfall — plus lift/terrain status and traffic cams.",
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
      </body>
    </html>
  );
}
