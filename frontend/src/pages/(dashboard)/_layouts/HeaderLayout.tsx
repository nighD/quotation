import React, { useState, useRef, useEffect } from "react";
import { Menu, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

interface HeaderLayoutProps {
  onOpenMobileMenu: () => void;
}

export const HeaderLayout: React.FC<HeaderLayoutProps> = ({
  onOpenMobileMenu,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    const isProd = import.meta.env.PROD;
    const isVercel = window.location.hostname.includes("vercel.app");
    const isCustomDomain = window.location.hostname.includes("goealliance.org");
    if (isProd && !isVercel && !isCustomDomain) {
      window.location.href = "https://dashboard.vifcpass.com/login";
    } else {
      navigate("/login");
    }
  };

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

        <Link to="/" className="flex items-center gap-2">
          <img
            src="/admin/logo-vifc.png"
            alt="On-Chainpass"
            className="h-6.5 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </Link>
      </div>

      <div className="flex items-center gap-2.5 relative" ref={dropdownRef}>
        <div className="text-right hidden xs:block">
          <span className="block text-[10px] uppercase font-['Inter'] font-semibold tracking-wider text-[#B58F6F]">
            {user?.roles?.includes("admin") ? "ADMIN" : "VIP MEMBER"}
          </span>
          <span className="block text-[12px] font-['Inter'] font-bold text-[#1B1A16] max-w-[120px] truncate">
            {user?.full_name || "Hoàng Vương"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-xs shrink-0 cursor-pointer focus:outline-none"
        >
          <img
            src={
              user?.avatar_url ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            }
            alt={user?.full_name || "User Avatar"}
            className="w-full h-full object-cover"
          />
        </button>

        {/* Dropdown Popup */}
        {dropdownOpen && (
          <div className="absolute right-0 top-[120%] mt-2 w-48 bg-white rounded-xl shadow-lg p-2 z-50 text-left border border-stone-100 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 text-[#9A4D3A] hover:bg-[#F8E4DD] rounded-lg p-2 transition-colors font-medium text-[14px] cursor-pointer w-full text-left"
              >
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderLayout;
