import { ReactNode } from "react";
import "./globals.css";

// Este layout raiz é apenas um passthrough.
// O html/body/Provider são definidos em src/app/[locale]/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
