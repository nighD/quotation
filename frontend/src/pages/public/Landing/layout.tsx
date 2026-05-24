import type { ReactNode } from "react";
import { Header } from "./_layouts/header";

export function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full font-sans antialiased overflow-x-hidden relative">
      <Header />
      {children}
    </div>
  );
}