import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/client";

export interface UpgradeRequestSummary {
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

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestUpdated?: (request: UpgradeRequestSummary | null) => void;
  onSuccess?: () => void;
}

const ENABLE_UPGRADE_MODAL = false;

export const UpgradeModal: React.FC<UpgradeModalProps> = (props) => {
  if (!ENABLE_UPGRADE_MODAL) {
    return null;
  }
  return <UpgradeModalContent {...props} />;
};

const UpgradeModalContent: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onRequestUpdated, onSuccess }) => {
  const { user, setUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeSubmitting, setUpgradeSubmitting] = useState(false);
  const [upgradeRequest, setUpgradeRequest] = useState<UpgradeRequestSummary | null>(null);
  const [upgradeMessage, setUpgradeMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [upgradeForm, setUpgradeForm] = useState({
    company: user?.company || "",
    country: user?.country || "",
    note: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !user) return;

    setUpgradeMessage(null);
    setUpgradeForm({
      company: user?.company || "",
      country: user?.country || "",
      note: "",
    });

    const fetchUpgradeRequest = async () => {
      setUpgradeLoading(true);
      try {
        const { data } = await apiClient.get("/engagement/upgrade-requests/me");
        const reqData = data.data || null;
        setUpgradeRequest(reqData);
        onRequestUpdated?.(reqData);
      } catch (error) {
        console.error("Failed to fetch upgrade request status", error);
        setUpgradeRequest(null);
      } finally {
        setUpgradeLoading(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, user]);

  const handleUpgradeSubmit = async () => {
    setUpgradeSubmitting(true);
    setUpgradeMessage(null);
    try {
      const { data } = await apiClient.post("/engagement/upgrade-requests", upgradeForm);
      setUpgradeRequest(data.data);
      onRequestUpdated?.(data.data);
      setUpgradeMessage({
        type: "success",
        text: "Upgrade request submitted to admin.",
      });

      try {
        const profileRes = await apiClient.get("/auth/profile");
        setUser(profileRes.data.data);
      } catch (profileError) {
        console.error("Failed to reload profile after card registration", profileError);
      }

      onSuccess?.();
    } catch (error: unknown) {
      const message = (error as ApiError).response?.data?.message || "Failed to submit upgrade request.";
      setUpgradeMessage({ type: "error", text: message });

      try {
        const { data } = await apiClient.get("/engagement/upgrade-requests/me");
        const reqData = data.data || null;
        setUpgradeRequest(reqData);
        onRequestUpdated?.(reqData);
      } catch (fetchError) {
        console.error("Failed to refresh upgrade request status", fetchError);
      }
    } finally {
      setUpgradeSubmitting(false);
    }
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs p-3 sm:p-4 md:p-6 flex items-center justify-center overflow-hidden pointer-events-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-lg sm:max-w-xl max-h-[min(90vh,calc(100dvh-2rem))] sm:max-h-[min(90vh,calc(100dvh-3rem))] rounded-3xl sm:rounded-[28px] bg-[#F8F1EA] shadow-2xl border border-[#E4D6CA] overflow-hidden flex flex-col my-auto"
          >
            <div className="w-full flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7 pr-3.5 sm:pr-5">
              <div className="flex items-start justify-between gap-4 mb-4 sm:mb-5">
              <div>
                <h2 className="text-[26px] sm:text-[30px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">Upgrade For Free</h2>
                <p className="mt-1 text-[11px] sm:text-[12px] font-['Inter']! text-[#664E48] leading-relaxed">
                  Gửi thông tin cho admin để xét duyệt, cấp số thứ tự và gắn role cho tài khoản.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-stone-200/60 text-[#664E48] hover:text-[#1B1A16] flex items-center justify-center text-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {upgradeMessage && (
              <div
                className={`mb-4 rounded-2xl px-4 py-3 text-[12px] font-['Inter']! ${upgradeMessage.type === "success" ? "bg-[#E8D7C9] text-[#523C37]" : "bg-[#F8E4DD] text-[#9A4D3A]"
                  }`}
              >
                {upgradeMessage.text}
              </div>
            )}

            {upgradeLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#664E48]">
                <div className="w-7 h-7 border-2 border-[#B58F6F] border-t-transparent rounded-full animate-spin" />
                <span className="text-[13px] font-['Inter']!">Loading...</span>
              </div>
            ) : upgradeRequest && upgradeRequest.status !== "rejected" ? (
              <div className="space-y-4">
                <div className="rounded-2xl sm:rounded-3xl bg-white/80 border border-[#E4D6CA] p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-[10px] sm:text-[11px] font-['Inter']! uppercase tracking-[0.2em] text-[#B58F6F]">Current status</p>
                      <h3 className="mt-1 text-[22px] sm:text-[26px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16] capitalize">
                        {upgradeRequest.status}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] sm:text-[11px] font-['Inter']! uppercase tracking-[0.2em] text-[#B58F6F]">Queue</p>
                      <p className="mt-1 text-[20px] sm:text-[22px] font-['Cormorant_Garamond']! font-semibold! text-[#523C37]">
                        #{upgradeRequest.queue_number}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-[12px] font-['Inter']! text-[#523C37]">
                    <div className="rounded-2xl bg-[#F7EEE7] p-3">
                      <span className="block text-[#B58F6F] uppercase tracking-[0.16em] text-[10px]">Role</span>
                      <span className="block mt-1 font-medium uppercase">Premium</span>
                    </div>
                    <div className="rounded-2xl bg-[#F7EEE7] p-3">
                      <span className="block text-[#B58F6F] uppercase tracking-[0.16em] text-[10px]">Card</span>
                      <span className="block mt-1 font-medium uppercase truncate">{upgradeRequest.card_number || "Waiting for approval"}</span>
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
                    onClick={onClose}
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
                    <span className="block text-[10px] sm:text-[11px] font-['Inter']! uppercase tracking-[0.18em] text-[#B58F6F] mb-1.5">Company</span>
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
                    <span className="block text-[10px] sm:text-[11px] font-['Inter']! uppercase tracking-[0.18em] text-[#B58F6F] mb-1.5">Country</span>
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
                  <span className="block text-[#B58F6F] uppercase tracking-[0.16em] text-[10px]">Assigned role</span>
                  <span className="mt-0.5 block font-medium uppercase">Premium Member</span>
                </div>

                <label className="block">
                  <span className="block text-[10px] sm:text-[11px] font-['Inter']! uppercase tracking-[0.18em] text-[#B58F6F] mb-1.5">Note for admin</span>
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
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-[#D9C8BA] text-[12px] font-['Inter']! font-medium uppercase tracking-wider text-[#523C37] cursor-pointer hover:bg-stone-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={upgradeSubmitting || !upgradeForm.company.trim()}
                    onClick={handleUpgradeSubmit}
                    className="bg-[#523C37] hover:bg-[#382b24] disabled:opacity-60 text-white text-[12px] font-['Inter']! font-medium px-5 py-2.5 rounded-xl uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                  >
                    {upgradeSubmitting ? "Submitting..." : "Send To Admin"}
                  </button>
                </div>
              </div>
            )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
