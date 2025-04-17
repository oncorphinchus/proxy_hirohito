import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SuppressHydrationWarning from "./components/SupressHydrationWarning";
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Add font-display swap for better performance
});

export const metadata: Metadata = {
  title: "Linode Server Monitor",
  description: "Monitor your Linode server's resources and proxy status in real-time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <SuppressHydrationWarning>
          {children}
        </SuppressHydrationWarning>
        <Analytics />
      </body>
    </html>
  );
}
