import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
const inter = Inter({ subsets: ["latin"] });
import Head from "next/head";
import { Zap } from "lucide-react";
export const metadata: Metadata = {
  title: "PrivGPT Studio",
  description:
    "Experience the future of AI conversations with both cloud-powered Gemini and privacy-focused local models",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Head>
          <title>PrivGPT Studio</title>
          <meta
            name="description"
            content="Experience the future of AI conversations with both cloud-powered Gemini and privacy-focused local models"
          />
          <link rel="icon" href="/logo.png" />
        </Head>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-right" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
