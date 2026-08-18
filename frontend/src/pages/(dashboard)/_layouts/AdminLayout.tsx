import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { MenuSidebar } from "./MenuSidebar";
import { HeaderLayout } from "./HeaderLayout";
import { usePageMetadata, ADMIN_DEFAULT_METADATA } from "../../../hooks/usePageMetadata";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  usePageMetadata(ADMIN_DEFAULT_METADATA);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row h-screen min-h-screen overflow-hidden bg-[#F2E8E0]">
      <HeaderLayout onOpenMobileMenu={() => setMobileMenuOpen(true)} />

      <MenuSidebar
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-61px)] lg:h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-6 xl:p-8 custom-scrollbar">
          <div className="w-full max-w-420 mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
