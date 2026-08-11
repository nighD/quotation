import React from 'react';
import { Outlet } from 'react-router-dom';
import { MenuSidebar } from './MenuSidebar';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {

  return (
    <div className="flex h-screen overflow-hidden bg-[#F2E8E0]">
      <MenuSidebar />
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="w-full">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
