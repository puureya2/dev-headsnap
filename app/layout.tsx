import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "headsnap.ai — AI Professional Headshots in Minutes",
  description:
    "Upload 8-12 selfies and get 50 stunning professional headshots powered by AI. Perfect for LinkedIn, resumes, and professional profiles. Only $15.",
  keywords: ["AI headshots", "professional photos", "LinkedIn photos", "AI photography"],
  openGraph: {
    title: "headsnap.ai — AI Professional Headshots in Minutes",
    description:
      "Upload 8-12 selfies and get 50 stunning professional headshots powered by AI. Only $15.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "headsnap.ai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "headsnap.ai — AI Professional Headshots in Minutes",
    description: "Upload 8-12 selfies and get 50 stunning professional headshots. Only $15.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />
      </body>
    </html>
  );
}
