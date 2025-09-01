import type { Metadata } from "next";
// We have removed the 'Inter' font import from 'next/font/google'
import "./globals.css"; // This import is essential for Tailwind to work.
import Toaster from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Restaurant Billing App",
  description: "Billing & Analytics for your restaurant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* We now link directly to the Google Font CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      {/* The font is applied directly via a style tag for reliability */}
      <body style={{ fontFamily: "'Inter', sans-serif" }}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

