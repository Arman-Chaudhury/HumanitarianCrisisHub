import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";

export const metadata: Metadata = {
  title: {
    default: "Crisis Hub — Act on Global Humanitarian Crises",
    template: "%s | Crisis Hub",
  },
  description:
    "A free resource hub documenting global humanitarian crises with actionable ways to help: donate, spread awareness, and demand political change.",
  metadataBase: new URL("https://crisishub.org"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Crisis Hub",
    title: "Crisis Hub — Act on Global Humanitarian Crises",
    description:
      "One website. Every crisis. Three actions: Donate, Amplify, Demand Change.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Crisis Hub — Every Crisis. Real Action.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crisis Hub — Act on Global Humanitarian Crises",
    description:
      "One website. Every crisis. Three actions: Donate, Amplify, Demand Change.",
    images: ["/og.jpg"],
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <SmoothScrollProvider />
        {/* Ambient background glow */}
        <div className="ambient-glow" />

        {/* Main page wrapper */}
        <div className="relative z-10 max-w-[920px] mx-auto px-5 sm:px-7 pt-8 pb-16">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
