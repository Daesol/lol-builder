// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import '@/app/globals.css'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LoL Item Builder",
  description: "League of Legends item builder and game analyzer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-gray-950 text-gray-100`}>
        <main className="container mx-auto p-4">
          <nav className="py-4">
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}