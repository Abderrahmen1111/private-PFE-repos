import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Phantom Marketplace",
  description: "A modern marketplace with immersive 3D background",
};

import dynamic from 'next/dynamic';

const GlobalActionDrawer = dynamic(() => import('@/components/GlobalActionDrawer'), {
  ssr: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <GlobalActionDrawer />
        <Toaster />
      </body>
    </html>
  );
}
