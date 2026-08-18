import type { ReactNode } from "react";
import { Header } from "./_layouts/header";
import { usePageMetadata, DEFAULT_PAGE_METADATA } from "../../../hooks/usePageMetadata";

export function LandingLayout({ children }: { children: ReactNode }) {
  usePageMetadata(DEFAULT_PAGE_METADATA);

  return (
    <div className="w-full font-sans antialiased overflow-x-hidden relative">
      <Header />
      {children}
    </div>
  );
}