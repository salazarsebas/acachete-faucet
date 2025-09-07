import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stellar Testnet Faucet | Get Free XLM for Development",
  description: "Get free Stellar testnet tokens (XLM) instantly for blockchain development. A reliable Friendbot alternative with higher limits and 99.9% uptime.",
  keywords: "stellar testnet faucet, get test xlm, stellar friendbot alternative, stellar testnet tokens, free xlm testnet",
  openGraph: {
    title: "Stellar Testnet Faucet | Free XLM for Developers",
    description: "Get free Stellar testnet tokens instantly for blockchain development. Higher limits than Friendbot with no registration required.",
    url: "https://acachete.xyz",
    siteName: "Acachete Labs",
    images: [
      {
        url: "/acachete-labs-icon.png",
        width: 1200,
        height: 630,
        alt: "Stellar Testnet Faucet by Acachete Labs",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Free Stellar Testnet Tokens | Developer Faucet",
    description: "Instantly receive test XLM for Stellar blockchain development. Better than Friendbot with higher limits.",
    images: ["/acachete-labs-icon.png"],
    creator: "@acachetelabs",
  },
  alternates: {
    canonical: "https://acachete.xyz",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

