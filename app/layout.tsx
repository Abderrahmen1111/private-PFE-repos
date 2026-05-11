import type { Metadata } from "next";
import { SessionProvider } from '@/components/session-provider'

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

const MessageBubble = dynamic(() => import('@/components/messaging/MessageBubble').then(mod => mod.MessageBubble), {
  ssr: false,
});

const ChatHeads = dynamic(() => import('@/components/messaging/ChatHeads').then(mod => mod.ChatHeads), {
  ssr: false,
});

import { AINotificationTrigger } from '@/components/notifications/AINotificationTrigger';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          <AINotificationTrigger />
          {children}
          <GlobalActionDrawer />
          <ChatHeads />
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
