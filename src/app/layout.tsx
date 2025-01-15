// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";

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
            <h1 className="text-3xl font-bold text-center text-blue-400">
              LoL Item Builder
            </h1>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}