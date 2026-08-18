import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, LogOut, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { cn } from "../../../utils/cn";
import { mainMenuItems, secondaryMenuItems, type MenuItem } from "../admin/_constants/menu";

export interface MenuSidebarProps {
  activePath?: string;
  onNavigate?: (path: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const MenuSidebar = ({ activePath, onNavigate, collapsed, onToggleCollapse, isMobileOpen = false, onCloseMobile }: MenuSidebarProps) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
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

  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;

  const handleToggle = () => {
    const nextState = !isCollapsed;
    if (onToggleCollapse) {
      onToggleCollapse(nextState);
    } else {
      setInternalCollapsed(nextState);
    }
  };

  const currentPath = activePath || location.pathname || "/home";

  const handleItemClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderMenuItem = (item: MenuItem, forceExpanded = false) => {
    const collapsedState = forceExpanded ? false : isCollapsed;
    const isActive =
      currentPath === item.path ||
      (item.path !== "/home" && currentPath.startsWith(item.path + "/")) ||
      (item.path === "/home" && (currentPath === "/home" || currentPath === "/home/home"));

    const LucideIconComp = item.lucideIcon;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleItemClick(item.path)}
        title={collapsedState ? item.label : undefined}
        className={`flex items-center transition-all duration-200 cursor-pointer font-semibold group relative ${
          collapsedState ? "justify-center w-11 h-11 mx-auto rounded-full" : "w-full px-3.5 py-2.5 rounded-full text-left gap-3.5"
        } ${isActive ? "text-[#D16419]" : "text-[#8B837C] hover:text-stone-900 hover:bg-stone-50"}`}
      >
        {/* Active Indicator Background Pill */}
        {isActive && (
          <motion.div
            layoutId={forceExpanded ? "active-pill-mobile" : "active-pill"}
            className={cn("absolute inset-0 bg-[#F2E8E0]", collapsedState ? "rounded-full" : "rounded-full")}
            initial={false}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        <div className="relative z-10 flex items-center justify-center transition-transform group-hover:scale-105 w-6 h-6 shrink-0">
          <img
            src={item.iconName}
            alt={item.label}
            className={`w-5 h-5 object-contain transition-all ${isActive ? "opacity-100 active-menu-icon" : "opacity-70 group-hover:opacity-100"}`}
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
              const fallback = (e.target as HTMLElement).nextElementSibling;
              if (fallback) fallback.classList.remove("hidden");
            }}
          />
          <LucideIconComp size={20} className={`hidden transition-all ${isActive ? "text-[#D16419]" : "text-[#8B837C]"}`} />
        </div>

        <AnimatePresence mode="wait">
          {!collapsedState && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="text-[19px] sm:text-[20px] font-['Cormorant_Garamond'] font-semibold whitespace-nowrap overflow-hidden text-ellipsis flex-1 relative z-10"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    );
  };

  const renderSidebarContent = (isDrawer = false) => {
    const collapsedState = isDrawer ? false : isCollapsed;

    return (
      <div className="w-full flex-1 min-h-0 flex flex-col justify-between overflow-y-auto overflow-x-hidden custom-scrollbar pr-0.5">
        <div>
          <div className={`flex items-center mb-6 pt-1 transition-all duration-200 ${collapsedState ? "justify-center px-0" : "px-2 justify-between"}`}>
            <Link to="/home" onClick={() => isDrawer && onCloseMobile?.()} className="flex items-center gap-1.5 hover:opacity-90 transition">
              <AnimatePresence mode="wait">
                <motion.img
                  key={collapsedState ? "logo-collapsed" : "logo-expanded"}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  src={collapsedState ? "/admin/logo.png" : "/admin/logo-vifc.png"}
                  alt="Logo"
                  className="h-7 sm:h-8 object-contain"
                />
              </AnimatePresence>
            </Link>

            {isDrawer && (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close sidebar"
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Main Nav */}
          <nav className="flex flex-col gap-1">{mainMenuItems.map((item) => renderMenuItem(item, isDrawer))}</nav>

          {secondaryMenuItems.length > 0 && (
            <>
              <div className="my-4 px-2">
                <div className="h-px bg-stone-100 w-full" />
              </div>

              {/* Secondary Nav */}
              <nav className="flex flex-col gap-1">{secondaryMenuItems.map((item) => renderMenuItem(item, isDrawer))}</nav>
            </>
          )}
        </div>

        {/* Bottom User Profile & Logout */}
        <div className="pt-3 border-t border-stone-100">
          {collapsedState ? (
            <div className="flex flex-col items-center gap-2 pb-1">
              <img
                src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                alt={user?.full_name || "User Avatar"}
                title={user?.full_name || "User Avatar"}
                className="w-9 h-9 rounded-full object-cover border border-stone-200 shadow-xs"
              />
              <button
                type="button"
                onClick={handleLogout}
                title="Log out"
                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-[#F8E4DD] text-stone-500 hover:text-[#9A4D3A] flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-2xl hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <img
                    src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                    alt={user?.full_name || "User Avatar"}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-stone-200 shadow-xs"
                  />
                </div>
                <div className="flex flex-col min-w-0 overflow-hidden text-left">
                  <span className="text-stone-400 text-[11px] sm:text-[12px] font-normal leading-tight truncate">Welcome back 👋</span>
                  <span className="text-stone-900 font-bold text-[13px] sm:text-[14px] leading-snug truncate font-poppins">
                    {user?.full_name || "Hoàng Vương (Admin)"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất"
                className="w-8.5 h-8.5 rounded-xl bg-stone-100/90 hover:bg-[#F8E4DD] text-stone-500 hover:text-[#9A4D3A] flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar (lg and above) */}
      <motion.aside
        animate={{ width: isCollapsed ? 84 : 280 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className={cn(
          "hidden lg:flex h-screen sticky top-0 shrink-0 bg-white border-r border-stone-100 shadow-xl shadow-stone-200/30 select-none z-40 overflow-visible flex-col",
          isCollapsed ? "p-3" : "p-5 rounded-r-4xl",
        )}
      >
        {/* Toggle Button */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3.5 top-7 z-50 w-7 h-7 bg-white border border-stone-200/90 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 shadow-md hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <motion.div animate={{ rotate: isCollapsed ? 0 : 180 }} transition={{ duration: 0.25 }} className="flex items-center justify-center">
            <ChevronRight size={15} strokeWidth={2.2} />
          </motion.div>
        </button>

        {renderSidebarContent(false)}
      </motion.aside>

      {/* Mobile Drawer (Below lg) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
            />

            {/* Off-canvas sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] sm:w-[320px] bg-white p-5 shadow-2xl flex flex-col lg:hidden rounded-r-3xl"
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
