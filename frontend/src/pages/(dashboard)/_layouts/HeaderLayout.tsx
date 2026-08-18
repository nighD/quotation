import React from "react";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

interface HeaderLayoutProps {
  onOpenMobileMenu: () => void;
}

export const HeaderLayout: React.FC<HeaderLayoutProps> = ({
  onOpenMobileMenu,
}) => {
  const { user } = useAuth();

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#E8D7C9]/95 backdrop-blur-md border-b border-[#dfd3c7] sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open mobile navigation"
          className="w-10 h-10 rounded-xl bg-white/90 border border-stone-200/80 flex items-center justify-center text-[#523C37] hover:bg-white shadow-xs cursor-pointer transition-all active:scale-95"
        >
          <Menu size={20} strokeWidth={2.2} />
        </button>

        <Link to="/home" className="flex items-center gap-2">
          <img
            src="/admin/logo-vifc.png"
            alt="VIFC Pass"
            className="h-6.5 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </Link>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="text-right hidden xs:block">
          <span className="block text-[10px] uppercase font-['Inter'] font-semibold tracking-wider text-[#B58F6F]">
            {user?.roles?.includes("admin") ? "ADMIN" : "VIP MEMBER"}
          </span>
          <span className="block text-[12px] font-['Inter'] font-bold text-[#1B1A16] max-w-[120px] truncate">
            {user?.full_name || "Hoàng Vương"}
          </span>
        </div>

        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-xs shrink-0">
          <img
            src={
              user?.avatar_url ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            }
            alt={user?.full_name || "User Avatar"}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default HeaderLayout;
