import { ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { apiClient } from "../../../api/client";
import { cn } from "../../../utils/cn";
import {
  mainMenuItems,
  secondaryMenuItems,
  type MenuItem,
} from "../admin/_constants/menu";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface UpgradeRequestSummary {
  id: string;
  company: string;
  country: string;
  note: string;
  status: "pending" | "approved" | "rejected";
  requested_role: string;
  queue_number: number;
  card_number?: string;
  review_note?: string;
}

export interface MenuSidebarProps {
  activePath?: string;
  onNavigate?: (path: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const MenuSidebar = ({
  activePath,
  onNavigate,
  collapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: MenuSidebarProps) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeSubmitting, setUpgradeSubmitting] = useState(false);
  const [upgradeRequest, setUpgradeRequest] =
    useState<UpgradeRequestSummary | null>(null);
  const [upgradeMessage, setUpgradeMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const defaultUpgradeForm = {
    company: user?.company || "",
    country: user?.country || "",
    note: "",
  };
  const [upgradeForm, setUpgradeForm] = useState({
    ...defaultUpgradeForm,
  });

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

  useEffect(() => {
    if (!user) return;

    const fetchUpgradeRequest = async () => {
      setUpgradeLoading(true);
      try {
        const { data } = await apiClient.get("/engagement/upgrade-requests/me");
        setUpgradeRequest(data.data || null);
      } catch (error) {
        console.error("Failed to fetch upgrade request status", error);
        setUpgradeRequest(null);
      } finally {
        setUpgradeLoading(false);
      }
    };

    fetchUpgradeRequest();
  }, [user]);

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

  const handleUpgradeClick = () => {
    setUpgradeMessage(null);
    setUpgradeForm(defaultUpgradeForm);
    setShowUpgradeModal(true);
  };

  const handleUpgradeSubmit = async () => {
    setUpgradeSubmitting(true);
    setUpgradeMessage(null);
    try {
      const { data } = await apiClient.post(
        "/engagement/upgrade-requests",
        upgradeForm,
      );
      setUpgradeRequest(data.data);
      setUpgradeMessage({
        type: "success",
        text: "Upgrade request submitted to admin.",
      });

      try {
        const profileRes = await apiClient.get("/auth/profile");
        setUser(profileRes.data.data);
      } catch (profileError) {
        console.error(
          "Failed to reload profile after card registration",
          profileError,
        );
      }
    } catch (error: unknown) {
      const message =
        (error as ApiError).response?.data?.message ||
        "Failed to submit upgrade request.";
      setUpgradeMessage({ type: "error", text: message });

      try {
        const { data } = await apiClient.get("/engagement/upgrade-requests/me");
        setUpgradeRequest(data.data || null);
      } catch (fetchError) {
        console.error("Failed to refresh upgrade request status", fetchError);
      }
    } finally {
      setUpgradeSubmitting(false);
    }
  };

  const getUpgradeButtonLabel = () => {
    if (upgradeLoading) return "LOADING...";
    if (!upgradeRequest) return "Đăng kí card";
    if (upgradeRequest.status === "pending")
      return `PENDING #${upgradeRequest.queue_number}`;
    if (upgradeRequest.status === "approved")
      return upgradeRequest.card_number
        ? `REGISTERED ${upgradeRequest.card_number}`
        : `REGISTERED #${upgradeRequest.queue_number}`;
    return "REAPPLY UPGRADE";
  };

  const upgradeButtonClass =
    upgradeRequest?.status === "approved"
      ? "bg-[#2F4B3C] hover:bg-[#24382d]"
      : upgradeRequest?.status === "pending"
        ? "bg-[#8A6A52] hover:bg-[#7b5d49]"
        : "bg-[#523C37] hover:bg-[#382b24]";

  const renderMenuItem = (item: MenuItem, forceExpanded = false) => {
    const collapsedState = forceExpanded ? false : isCollapsed;
    const isActive =
      currentPath === item.path ||
      (item.path !== "/home" && currentPath.startsWith(item.path + "/")) ||
      (item.path === "/home" &&
        (currentPath === "/home" || currentPath === "/home/home"));

    const LucideIconComp = item.lucideIcon;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleItemClick(item.path)}
        title={collapsedState ? item.label : undefined}
        className={`flex items-center transition-all duration-200 cursor-pointer font-semibold group relative ${
          collapsedState
            ? "justify-center w-11 h-11 mx-auto rounded-full"
            : "w-full px-3.5 py-2.5 rounded-full text-left gap-3.5"
        } ${
          isActive
            ? "text-[#D16419]"
            : "text-[#8B837C] hover:text-stone-900 hover:bg-stone-50"
        }`}
      >
        {/* Active Indicator Background Pill */}
        {isActive && (
          <motion.div
            layoutId={forceExpanded ? "active-pill-mobile" : "active-pill"}
            className={cn(
              "absolute inset-0 bg-[#F2E8E0]",
              collapsedState ? "rounded-full" : "rounded-full",
            )}
            initial={false}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        <div className="relative z-10 flex items-center justify-center transition-transform group-hover:scale-105 w-6 h-6 shrink-0">
          <img
            src={item.iconName}
            alt={item.label}
            className={`w-5 h-5 object-contain transition-all ${
              isActive
                ? "opacity-100 active-menu-icon"
                : "opacity-70 group-hover:opacity-100"
            }`}
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
              const fallback = (e.target as HTMLElement).nextElementSibling;
              if (fallback) fallback.classList.remove("hidden");
            }}
          />
          <LucideIconComp
            size={20}
            className={`hidden transition-all ${isActive ? "text-[#D16419]" : "text-[#8B837C]"}`}
          />
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
          {/* Logo Section */}
          <div
            className={`flex items-center mb-6 pt-1 transition-all duration-200 ${
              collapsedState ? "justify-center px-0" : "px-2 justify-between"
            }`}
          >
            <Link
              to="/home"
              onClick={() => isDrawer && onCloseMobile?.()}
              className="flex items-center gap-1.5 hover:opacity-90 transition"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={collapsedState ? "logo-collapsed" : "logo-expanded"}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  src={
                    collapsedState ? "/admin/logo.png" : "/admin/logo-vifc.png"
                  }
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
          <nav className="flex flex-col gap-1">
            {mainMenuItems.map((item) => renderMenuItem(item, isDrawer))}
          </nav>

          {secondaryMenuItems.length > 0 && (
            <>
              <div className="my-4 px-2">
                <div className="h-px bg-stone-100 w-full" />
              </div>

              {/* Secondary Nav */}
              <nav className="flex flex-col gap-1">
                {secondaryMenuItems.map((item) =>
                  renderMenuItem(item, isDrawer),
                )}
              </nav>
            </>
          )}
        </div>

        {/* Bottom Section: Pass Card & User Profile */}
        <div className="pt-4">
          <AnimatePresence>
            {!collapsedState && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                className="my-3 flex flex-col items-center gap-3 overflow-hidden"
              >
                <div className="w-full max-w-[230px] h-[140px] rounded-xl bg-linear-to-b from-[#FCEDD1] to-[#D6B27E] border border-[#e0c4a4]/40 shadow-sm relative overflow-hidden group flex items-center justify-center p-3">
                  <img
                    src="/admin/design-item-01.png"
                    alt=""
                    className="absolute top-1/2 -translate-y-1/2 left-2 w-10 sm:w-12 h-auto object-contain pointer-events-none z-0 opacity-95"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />

                  <img
                    src="/admin/design-item-02.png"
                    alt=""
                    className="absolute bottom-2 right-2 w-12 sm:w-14 h-auto object-contain pointer-events-none z-0 opacity-95"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />

                  <div className="relative z-10 w-[145px] sm:w-[155px] flex justify-center items-center transition-transform duration-300 group-hover:scale-105 mt-1">
                    <img
                      src="/admin/card-02.png"
                      alt=""
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-[90%] h-auto object-contain z-10 opacity-95"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />

                    <img
                      src="/admin/layout-card.png"
                      alt=""
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-[95%] h-auto object-contain z-20 opacity-95"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />

                    <img
                      src="/admin/card-01.png"
                      alt="IFC Pass Membership Card"
                      className="relative z-30 w-full h-auto object-contain drop-shadow-md rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUpgradeClick}
                  className={`w-full max-w-[230px] ${upgradeButtonClass} font-['Inter'] text-white font-medium text-[12px] sm:text-[13px] tracking-wider uppercase py-2.5 sm:py-3 px-4 rounded-lg shadow-md transition-all duration-200 cursor-pointer text-center active:scale-[0.98]`}
                >
                  {getUpgradeButtonLabel()}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Profile */}
          <div
            className={`pt-3 border-t border-stone-100 flex items-center transition-all ${
              collapsedState ? "justify-center" : "px-2 justify-start gap-3"
            }`}
          >
            <div className="relative shrink-0">
              <img
                src={
                  user?.avatar_url ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                }
                alt={user?.full_name || "User Avatar"}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-stone-200 shadow-xs"
              />
            </div>

            <AnimatePresence mode="wait">
              {!collapsedState && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col min-w-0 overflow-hidden"
                >
                  <span className="text-stone-400 text-[11px] sm:text-[12px] font-normal leading-tight truncate">
                    Welcome back 👋
                  </span>
                  <span className="text-stone-900 font-bold text-[13px] sm:text-[14px] leading-snug truncate font-poppins">
                    {user?.full_name || "Hoàng Vương (Admin)"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
          "hidden lg:flex h-screen sticky top-0 shrink-0 bg-white border-r border-stone-100 shadow-xl shadow-stone-200/30 select-none z-20 overflow-visible flex-col",
          isCollapsed ? "p-3" : "p-5 rounded-r-4xl",
        )}
      >
        {/* Toggle Button */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3.5 top-7 z-30 w-7 h-7 bg-white border border-stone-200/90 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 shadow-md hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-center"
          >
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

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs px-3 sm:px-4 py-6 sm:py-8 flex items-center justify-center overflow-y-auto"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-lg sm:max-w-xl rounded-[24px] sm:rounded-[28px] bg-[#F8F1EA] p-5 sm:p-7 shadow-2xl border border-[#E4D6CA] my-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-start justify-between gap-4 mb-4 sm:mb-5">
                <div>
                  <h2 className="text-[26px] sm:text-[30px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">
                    Upgrade For Free
                  </h2>
                  <p className="mt-1 text-[11px] sm:text-[12px] font-['Inter']! text-[#664E48] leading-relaxed">
                    Gửi thông tin cho admin để xét duyệt, cấp số thứ tự và gắn
                    role cho tài khoản.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-8 h-8 rounded-full bg-stone-200/60 text-[#664E48] hover:text-[#1B1A16] flex items-center justify-center text-lg cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {upgradeMessage && (
                <div
                  className={`mb-4 rounded-2xl px-4 py-3 text-[12px] font-['Inter']! ${
                    upgradeMessage.type === "success"
                      ? "bg-[#E8D7C9] text-[#523C37]"
                      : "bg-[#F8E4DD] text-[#9A4D3A]"
                  }`}
                >
                  {upgradeMessage.text}
                </div>
              )}

              {upgradeRequest && upgradeRequest.status !== "rejected" ? (
                <div className="space-y-4">
                  <div className="rounded-2xl sm:rounded-3xl bg-white/80 border border-[#E4D6CA] p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-[10px] sm:text-[11px] font-['Inter']! uppercase tracking-[0.2em] text-[#B58F6F]">
                          Current status
                        </p>
                        <h3 className="mt-1 text-[22px] sm:text-[26px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16] capitalize">
                          {upgradeRequest.status}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] sm:text-[11px] font-['Inter']! uppercase tracking-[0.2em] text-[#B58F6F]">
                          Queue
                        </p>
                        <p className="mt-1 text-[20px] sm:text-[22px] font-['Cormorant_Garamond']! font-semibold! text-[#523C37]">
                          #{upgradeRequest.queue_number}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-[12px] font-['Inter']! text-[#523C37]">
                      <div className="rounded-2xl bg-[#F7EEE7] p-3">
                        <span className="block text-[#B58F6F] uppercase tracking-[0.16em] text-[10px]">
                          Role
                        </span>
                        <span className="block mt-1 font-medium uppercase">
                          Premium
                        </span>
                      </div>
                      <div className="rounded-2xl bg-[#F7EEE7] p-3">
                        <span className="block text-[#B58F6F] uppercase tracking-[0.16em] text-[10px]">
                          Card
                        </span>
                        <span className="block mt-1 font-medium uppercase truncate">
                          {upgradeRequest.card_number || "Waiting for approval"}
                        </span>
                      </div>
                    </div>

                    {upgradeRequest.review_note && (
                      <div className="mt-3 rounded-2xl bg-[#F7EEE7] p-3 text-[12px] font-['Inter']! text-[#523C37] leading-relaxed">
                        {upgradeRequest.review_note}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowUpgradeModal(false)}
                      className="bg-[#523C37] hover:bg-[#382b24] text-white text-[12px] font-['Inter']! font-medium px-5 py-2.5 sm:py-3 rounded-xl uppercase tracking-wider cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <label className="block">
                      <span className="block text-[10px] sm:text-[11px] font-['Inter']! uppercase tracking-[0.18em] text-[#B58F6F] mb-1.5">
                        Company
                      </span>
                      <input
                        type="text"
                        value={upgradeForm.company}
                        onChange={(event) =>
                          setUpgradeForm((prev) => ({
                            ...prev,
                            company: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-[#D9C8BA] bg-white px-3.5 py-2.5 sm:py-3 text-[13px] text-[#1B1A16] outline-none focus:border-[#B58F6F]"
                        placeholder="Tên doanh nghiệp..."
                      />
                    </label>

                    <label className="block">
                      <span className="block text-[10px] sm:text-[11px] font-['Inter']! uppercase tracking-[0.18em] text-[#B58F6F] mb-1.5">
                        Country
                      </span>
                      <input
                        type="text"
                        value={upgradeForm.country}
                        onChange={(event) =>
                          setUpgradeForm((prev) => ({
                            ...prev,
                            country: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-[#D9C8BA] bg-white px-3.5 py-2.5 sm:py-3 text-[13px] text-[#1B1A16] outline-none focus:border-[#B58F6F]"
                        placeholder="Quốc gia..."
                      />
                    </label>
                  </div>

                  <div className="rounded-2xl bg-[#F7EEE7] px-4 py-2.5 sm:py-3 text-[12px] font-['Inter']! text-[#523C37]">
                    <span className="block text-[#B58F6F] uppercase tracking-[0.16em] text-[10px]">
                      Assigned role
                    </span>
                    <span className="mt-0.5 block font-medium uppercase">
                      Premium Member
                    </span>
                  </div>

                  <label className="block">
                    <span className="block text-[10px] sm:text-[11px] font-['Inter']! uppercase tracking-[0.18em] text-[#B58F6F] mb-1.5">
                      Note for admin
                    </span>
                    <textarea
                      rows={3}
                      value={upgradeForm.note}
                      onChange={(event) =>
                        setUpgradeForm((prev) => ({
                          ...prev,
                          note: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-[#D9C8BA] bg-white px-3.5 py-2.5 sm:py-3 text-[13px] text-[#1B1A16] outline-none focus:border-[#B58F6F] resize-none"
                      placeholder="Ghi chú thêm (nếu có)..."
                    />
                  </label>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowUpgradeModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-[#D9C8BA] text-[12px] font-['Inter']! font-medium uppercase tracking-wider text-[#523C37] cursor-pointer hover:bg-stone-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={
                        upgradeSubmitting || !upgradeForm.company.trim()
                      }
                      onClick={handleUpgradeSubmit}
                      className="bg-[#523C37] hover:bg-[#382b24] disabled:opacity-60 text-white text-[12px] font-['Inter']! font-medium px-5 py-2.5 rounded-xl uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                    >
                      {upgradeSubmitting ? "Submitting..." : "Send To Admin"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
