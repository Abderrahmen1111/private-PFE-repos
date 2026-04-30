"use client";

import { useSession } from "@/hooks/use-session";
import { ReactNode } from "react";

export function SessionProvider({ children }: { children: ReactNode }) {
  useSession();
  return <>{children}</>;
}