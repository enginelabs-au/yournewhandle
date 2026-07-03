"use client";

import { AppPreferencesProvider } from "@/context/AppPreferencesProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AppPreferencesProvider>{children}</AppPreferencesProvider>;
}
