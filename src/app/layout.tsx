import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Crisis Hub: humanitarian crisis briefings and how to help",
    template: "%s | Crisis Hub",
  },
  description:
    "Independent, sourced briefings on 52 humanitarian crises, with vetted organizations to support, ways to raise awareness, and steps to press for policy change.",
  metadataBase: new URL("https://crisis-hub.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Crisis Hub",
    title: "Crisis Hub: humanitarian crisis briefings and how to help",
    description:
      "Sourced briefings on 52 humanitarian crises, refreshed nightly from UN data, with vetted ways to help.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Crisis Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crisis Hub: humanitarian crisis briefings and how to help",
    description:
      "Sourced briefings on 52 humanitarian crises, refreshed nightly from UN data, with vetted ways to help.",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:p-4"
        >
          Skip to content
        </a>
        <header className="sticky top-0 z-[50] bg-white/95 border-b border-border-hard">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-7">
            <Navbar />
          </div>
        </header>
        <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-7 pt-8 pb-16">
          <main id="main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
