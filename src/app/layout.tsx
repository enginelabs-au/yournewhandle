import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { VercelAnalytics } from "@/components/VercelAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yournewhandle.com.au"),
  title: "yournewhandle",
  description:
    "Check username availability across 30 social platforms. Generate pronounceable handles with our phonetic engine.",
  openGraph: {
    title: "yournewhandle",
    description:
      "Check username availability across 30 social platforms. Generate pronounceable handles with our phonetic engine.",
    url: "https://yournewhandle.com.au",
    siteName: "yournewhandle",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "yournewhandle",
    description:
      "Check username availability across 30 social platforms. Generate pronounceable handles with our phonetic engine.",
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
