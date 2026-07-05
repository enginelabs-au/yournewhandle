import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { VercelAnalytics } from "@/components/VercelAnalytics";
import { PLATFORM_COUNT } from "@/lib/platforms-registry";
import { SITE_URL } from "@/lib/site/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const siteDescription = `Check username availability across ${PLATFORM_COUNT} platforms. Generate pronounceable handles with our phonetic engine.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "yournewhandle — handle generator & username checker",
    template: "%s | yournewhandle",
  },
  description: siteDescription,
  openGraph: {
    title: "yournewhandle — handle generator & username checker",
    description: siteDescription,
    url: SITE_URL,
    siteName: "yournewhandle",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "yournewhandle — handle generator & username checker",
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-base text-foreground">
        <Providers>{children}</Providers>
        <VercelAnalytics />
      </body>
    </html>
  );
}
