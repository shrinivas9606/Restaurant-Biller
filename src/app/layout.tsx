import type { Metadata } from "next";
// import { Toaster } from "@/components/ui/toaster"; // For showing notifications
// FIX: Update the import path if Toaster exists elsewhere, e.g.:
// import { Toaster } from "../components/ui/toaster"; // For showing notifications
import "./globals.css";

export const metadata: Metadata = {
  title: "Restaurant Billing App",
  description: "Billing & Analytics for Restaurants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Load Tailwind CSS from CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
        {/* Load Inter font from Google Fonts CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          body {
            font-family: 'Inter', sans-serif;
          }
        `}</style>
      </head>
      <body>
        <main className="bg-background text-foreground">{children}</main>
        {/* <Toaster /> */}
      </body>
    </html>
  );
}

