import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RYMdle",
  description: "A daily RYM rating based guessing game. Pick the highest rated album!",

  metadataBase: new URL("https://rymdle.vercel.app"),

  robots: {
    index: true,
    follow: true,
  },

  verification: {
    google: "z6zl-qXWeV0z_FgETQUu3jW4NEC3TPpSM3fqpSjURTk",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
      <Analytics />
    </html>
  );
}
