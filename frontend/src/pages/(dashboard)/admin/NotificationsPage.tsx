import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Filter, Mail, Newspaper, Search, UserCheck, X } from "lucide-react";
import { apiClient } from "../../../api/client";
import { useAuth } from "../../../context/AuthContext";

interface NewsletterSubscription {
  id: string;
  email: string;
  full_name: string;
  source: string;
  status: string;
  created_at: string;
}

interface NewsletterRegistration {
  id: string;
  user_id?: string;
  email: string;
  full_name: string;
  newsletter_id?: string;
  newsletter_title: string;
  newsletter_date: string;
  location: string;
  status: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

interface EventRegistration {
  id: string;
  user_id?: string;
  email: string;
  full_name: string;
  event_id?: string;
  event_title: string;
  event_date: string;
  location: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const formatDate = (value: string) => {
  if (!value) return "Just now";
  try {
    return new Date(value).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

type ActiveTab = "newsletter_registrations" | "event_registrations" | "subscribers";

export function NotificationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("newsletter_registrations");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Data states
  const [newsletterRegistrations, setNewsletterRegistrations] = useState<NewsletterRegistration[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscription[]>([]);

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const [nlRegRes, evRegRes, subRes] = await Promise.allSettled([
        apiClient.get("/admin/newsletters/registrations"),
        apiClient.get("/admin/events/registrations"),
        apiClient.get("/admin/notifications/newsletter"),
      ]);

      if (nlRegRes.status === "fulfilled" && nlRegRes.value.data?.success) {
        const list = Array.isArray(nlRegRes.value.data.data) ? nlRegRes.value.data.data : [];
        setNewsletterRegistrations(list);
      }

      if (evRegRes.status === "fulfilled" && evRegRes.value.data?.success) {
        const list = Array.isArray(evRegRes.value.data.data) ? evRegRes.value.data.data : [];
        setEventRegistrations(list);
      }

      if (subRes.status === "fulfilled" && subRes.value.data?.success) {
        const list = Array.isArray(subRes.value.data.data) ? subRes.value.data.data : [];
        setSubscribers(list);
      }
    } catch (error: any) {
      setFetchError(error.response?.data?.message || "Không thể tải toàn bộ dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const isSubscribed = useMemo(() => {
    if (!user?.email) return false;
    return subscribers.some((item) => item.email === user.email);
  }, [subscribers, user?.email]);

  const handleSubscribe = async () => {
    setSubscribing(true);
    setMessage(null);
    try {
      const { data } = await apiClient.post("/engagement/newsletter/subscribe", {
        source: "admin-notifications",
      });

      if (data.success && data.data) {
        const nextItem = data.data as NewsletterSubscription;
        setSubscribers((prev) => {
          const withoutCurrent = prev.filter((item) => item.email !== nextItem.email);
          return [nextItem, ...withoutCurrent];
        });
        setMessage({ type: "success", text: "Đã lưu đăng ký nhận newsletter của tài khoản hiện tại." });
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Đăng ký thất bại.",
      });
    } finally {
      setSubscribing(false);
    }
  };

  const handleUpdateNewsletterRegStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    setMessage(null);
    try {
      const { data } = await apiClient.put(`/admin/newsletters/registrations/${id}`, {
        status: newStatus,
      });

      if (data.success) {
        setNewsletterRegistrations((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
        setMessage({
          type: "success",
          text: `Đã cập nhật trạng thái sang "${newStatus === "confirmed" ? "Đã duyệt" : newStatus === "cancelled" ? "Đã huỷ" : newStatus}".`,
        });
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Cập nhật trạng thái thất bại.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered lists
  const filteredNewsletterRegs = useMemo(() => {
    return newsletterRegistrations.filter((item) => {
      const matchSearch =
        item.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.newsletter_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [newsletterRegistrations, searchQuery, statusFilter]);

  const filteredEventRegs = useMemo(() => {
    return eventRegistrations.filter((item) => {
      const matchSearch =
        item.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.event_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [eventRegistrations, searchQuery, statusFilter]);

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((item) => {
      return (
        item.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [subscribers, searchQuery]);

  return (
    <div className="w-full pb-10">
      {/* Header */}
      <div className="mb-6 select-none flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-['Cormorant_Garamond']! text-[32px] md:text-[38px] font-semibold! text-[#1B1A16] mb-1 leading-tight">
            Quản lý Đăng ký & Thông báo
          </h1>
          <p className="font-['Inter']! text-[13px] md:text-sm text-[#523C37] font-normal! leading-relaxed">
            Xem và quản lý tất cả user đã bấm đăng ký nhận Bản tin (Newsletter), Sự kiện (Events) và Email Subscribers.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAllData}
          disabled={loading}
          className="self-start md:self-auto bg-[#E8D7C9] hover:bg-[#dfcebf] text-[#523C37] px-4 py-2.5 rounded-xl font-['Inter']! text-[12px] font-medium transition cursor-pointer active:scale-95 flex items-center gap-2"
        >
          <Clock size={14} className={loading ? "animate-spin" : ""} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Alert message */}
      {message && (
        <div
          className={`mb-5 rounded-2xl px-4 py-3 text-[13px] font-['Inter']! flex items-center justify-between gap-2 shadow-xs ${
            message.type === "success" ? "bg-[#E3EDE5] text-[#2D7A46] border border-[#C5DEC9]" : "bg-[#F8E4DD] text-[#9A4D3A] border border-[#E9C6B8]"
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} className="cursor-pointer opacity-70 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 sm:gap-3 border-b border-[#DCD0C5] pb-3 mb-6 overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => {
            setActiveTab("newsletter_registrations");
            setStatusFilter("all");
          }}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl font-['Inter']! text-[12px] sm:text-[13px] font-medium transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "newsletter_registrations" ? "bg-[#523C37] text-white shadow-sm" : "bg-[#F0E4D8]/60 text-[#6C5345] hover:bg-[#E8D9CC]"
          }`}
        >
          <Newspaper size={15} />
          <span>Đăng ký Bản tin (Newsletter)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "newsletter_registrations" ? "bg-white/20 text-white" : "bg-[#D9C8BA] text-[#3C2A25]"
            }`}
          >
            {newsletterRegistrations.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("event_registrations");
            setStatusFilter("all");
          }}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl font-['Inter']! text-[12px] sm:text-[13px] font-medium transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "event_registrations" ? "bg-[#523C37] text-white shadow-sm" : "bg-[#F0E4D8]/60 text-[#6C5345] hover:bg-[#E8D9CC]"
          }`}
        >
          <UserCheck size={15} />
          <span>Đăng ký Sự kiện (Events)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "event_registrations" ? "bg-white/20 text-white" : "bg-[#D9C8BA] text-[#3C2A25]"
            }`}
          >
            {eventRegistrations.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("subscribers");
            setStatusFilter("all");
          }}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl font-['Inter']! text-[12px] sm:text-[13px] font-medium transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "subscribers" ? "bg-[#523C37] text-white shadow-sm" : "bg-[#F0E4D8]/60 text-[#6C5345] hover:bg-[#E8D9CC]"
          }`}
        >
          <Mail size={15} />
          <span>Email Subscribers</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "subscribers" ? "bg-white/20 text-white" : "bg-[#D9C8BA] text-[#3C2A25]"
            }`}
          >
            {subscribers.length}
          </span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 select-none">
        <div className="relative flex items-center bg-[#E5DBD2] rounded-full px-4 py-2.5 w-full sm:w-80 border border-transparent focus-within:border-[#B58F6F] focus-within:bg-white transition-all shadow-2xs">
          <Search size={16} className="text-[#664E48] shrink-0" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, tiêu đề, địa điểm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none font-['Inter'] text-[12.5px] text-[#1B1A16] placeholder:text-[#664E48]/60 w-full ml-2"
          />
        </div>

        {activeTab !== "subscribers" && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Filter size={15} className="text-[#8C6246]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F8F1EA] border border-[#E7D8CC] rounded-xl px-3 py-2 text-[12px] font-['Inter']! text-[#523C37] outline-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="cancelled">Đã huỷ</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === "newsletter_registrations" && (
        <section className="rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-[#EADFD5]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[22px] sm:text-[26px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">
              Danh sách User Đăng ký Newsletter ({filteredNewsletterRegs.length})
            </h2>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-[#F8F1EA] p-8 text-center text-[13px] font-['Inter']! text-[#664E48]">Đang tải danh sách đăng ký bản tin...</div>
          ) : fetchError ? (
            <div className="rounded-2xl bg-[#F8E4DD] p-6 text-center text-[13px] font-['Inter']! text-[#9A4D3A]">{fetchError}</div>
          ) : filteredNewsletterRegs.length === 0 ? (
            <div className="rounded-2xl bg-[#F8F1EA] p-8 text-center text-[13px] font-['Inter']! text-[#664E48]">Chưa có lượt đăng ký bản tin nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[760px] space-y-3">
                <div className="bg-[#E8D7C9] rounded-xl py-3 px-5 grid grid-cols-12 gap-3 items-center text-left font-['Cormorant_Garamond']! text-[16px] font-bold! text-[#1B1A16] border border-[#DFD3C7]/60">
                  <div className="col-span-3">Khách hàng</div>
                  <div className="col-span-4">Bản tin đăng ký</div>
                  <div className="col-span-2">Thời gian gửi</div>
                  <div className="col-span-3 text-right">Trạng thái & Thao tác</div>
                </div>

                {filteredNewsletterRegs.map((item, index) => {
                  const isUpdating = updatingId === item.id;
                  const isConfirmed = item.status === "confirmed";
                  const isCancelled = item.status === "cancelled";

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="rounded-2xl bg-[#F8F1EA] border border-[#E7D8CC] p-4 sm:p-5 grid grid-cols-12 gap-3 items-center hover:shadow-xs transition"
                    >
                      <div className="col-span-3 min-w-0">
                        <h3 className="text-[15px] font-['Inter']! font-semibold text-[#1B1A16] truncate" title={item.full_name || "Khách hàng"}>
                          {item.full_name || "Khách hàng"}
                        </h3>
                        <p className="text-[12px] font-['Inter']! text-[#664E48] truncate" title={item.email}>
                          {item.email}
                        </p>
                      </div>

                      <div className="col-span-4 min-w-0">
                        <p className="text-[14px] font-['Inter']! font-medium text-[#3C2A25] truncate" title={item.newsletter_title}>
                          {item.newsletter_title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-['Inter']! text-[#B58F6F] mt-1 flex-wrap">
                          <span>{item.newsletter_date}</span>
                          <span>•</span>
                          <span>{item.location}</span>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <p className="text-[12px] font-['Inter']! text-[#664E48]">{formatDate(item.created_at)}</p>
                      </div>

                      <div className="col-span-3 flex items-center justify-end gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                            isConfirmed
                              ? "bg-[#E3EDE5] text-[#2D7A46] border border-[#C5DEC9]"
                              : isCancelled
                                ? "bg-[#F8E4DD] text-[#9A4D3A] border border-[#E9C6B8]"
                                : "bg-[#FDF3E7] text-[#B0762E] border border-[#F6DEBE]"
                          }`}
                        >
                          {isConfirmed ? "Đã duyệt" : isCancelled ? "Đã huỷ" : "Chờ xác nhận"}
                        </span>

                        {!isConfirmed && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateNewsletterRegStatus(item.id, "confirmed")}
                            title="Xác nhận duyệt"
                            className="bg-[#2D7A46] hover:bg-[#25653a] text-white p-1.5 rounded-lg transition cursor-pointer active:scale-95 disabled:opacity-50"
                          >
                            <Check size={14} />
                          </button>
                        )}

                        {!isCancelled && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateNewsletterRegStatus(item.id, "cancelled")}
                            title="Huỷ đăng ký"
                            className="bg-[#9A4D3A] hover:bg-[#803d2d] text-white p-1.5 rounded-lg transition cursor-pointer active:scale-95 disabled:opacity-50"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === "event_registrations" && (
        <section className="rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-[#EADFD5]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[22px] sm:text-[26px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">
              Danh sách User Đăng ký Sự kiện ({filteredEventRegs.length})
            </h2>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-[#F8F1EA] p-8 text-center text-[13px] font-['Inter']! text-[#664E48]">Đang tải danh sách đăng ký sự kiện...</div>
          ) : filteredEventRegs.length === 0 ? (
            <div className="rounded-2xl bg-[#F8F1EA] p-8 text-center text-[13px] font-['Inter']! text-[#664E48]">Chưa có lượt đăng ký sự kiện nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[760px] space-y-3">
                <div className="bg-[#E8D7C9] rounded-xl py-3 px-5 grid grid-cols-12 gap-3 items-center text-left font-['Cormorant_Garamond']! text-[16px] font-bold! text-[#1B1A16] border border-[#DFD3C7]/60">
                  <div className="col-span-3">Khách hàng</div>
                  <div className="col-span-4">Sự kiện</div>
                  <div className="col-span-3">Thời gian & Địa điểm</div>
                  <div className="col-span-2 text-right">Trạng thái</div>
                </div>

                {filteredEventRegs.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="rounded-2xl bg-[#F8F1EA] border border-[#E7D8CC] p-4 sm:p-5 grid grid-cols-12 gap-3 items-center hover:shadow-xs transition"
                  >
                    <div className="col-span-3 min-w-0">
                      <h3 className="text-[15px] font-['Inter']! font-semibold text-[#1B1A16] truncate">{item.full_name || "Khách hàng"}</h3>
                      <p className="text-[12px] font-['Inter']! text-[#664E48] truncate">{item.email}</p>
                    </div>

                    <div className="col-span-4 min-w-0">
                      <p className="text-[14px] font-['Inter']! font-medium text-[#3C2A25] truncate">{item.event_title}</p>
                      <p className="text-[11px] font-['Inter']! text-[#B58F6F] mt-1">Ngày đăng ký: {formatDate(item.created_at)}</p>
                    </div>

                    <div className="col-span-3">
                      <p className="text-[12px] font-['Inter']! text-[#3C2A25]">{item.event_date}</p>
                      <p className="text-[11px] font-['Inter']! text-[#664E48] truncate">{item.location}</p>
                    </div>

                    <div className="col-span-2 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                          item.status === "confirmed"
                            ? "bg-[#E3EDE5] text-[#2D7A46] border border-[#C5DEC9]"
                            : "bg-[#FDF3E7] text-[#B0762E] border border-[#F6DEBE]"
                        }`}
                      >
                        {item.status === "confirmed" ? "Đã xác nhận" : "Chờ xử lý"}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === "subscribers" && (
        <div className="grid grid-cols-1 xl:grid-cols-[400px_minmax(0,1fr)] gap-5">
          <section className="rounded-3xl bg-white p-6 shadow-sm border border-[#EADFD5] h-fit">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-[11px] font-['Inter']! uppercase tracking-[0.2em] text-[#B58F6F]">Newsletter</p>
                <h2 className="mt-1 text-[26px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">Subscribe hiện tại</h2>
              </div>
              <div className="rounded-full bg-[#F5ECE5] px-3.5 py-1.5 text-[12px] font-['Inter']! text-[#523C37] font-medium">{subscribers.length} subs</div>
            </div>

            <div className="rounded-2xl bg-[#F8F1EA] border border-[#E7D8CC] p-4 mb-4">
              <p className="text-[11px] font-['Inter']! uppercase tracking-[0.18em] text-[#B58F6F]">Tài khoản đang đăng nhập</p>
              <h3 className="mt-1 text-[22px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">{user?.full_name || "Admin / User"}</h3>
              <p className="mt-0.5 text-[13px] font-['Inter']! text-[#664E48]">{user?.email || "Chưa có email"}</p>
            </div>

            <button
              type="button"
              disabled={subscribing || isSubscribed}
              onClick={handleSubscribe}
              className={`w-full rounded-2xl px-5 py-3.5 text-[12px] font-['Inter']! font-medium uppercase tracking-[0.18em] text-white transition cursor-pointer ${
                isSubscribed ? "bg-[#2F4B3C] cursor-default" : "bg-[#523C37] hover:bg-[#382b24] active:scale-95"
              }`}
            >
              {isSubscribed ? "Đã đăng ký ✓" : subscribing ? "Đang lưu..." : "Đăng ký nhận email"}
            </button>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm border border-[#EADFD5] min-w-0">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-[11px] font-['Inter']! uppercase tracking-[0.2em] text-[#B58F6F]">Subscribers List</p>
                <h2 className="mt-1 text-[26px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">
                  Danh sách Email Đăng ký ({filteredSubscribers.length})
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-[#F8F1EA] p-5 text-[13px] font-['Inter']! text-[#664E48]">Đang tải...</div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="rounded-2xl bg-[#F8F1EA] p-5 text-[13px] font-['Inter']! text-[#664E48]">Chưa có người đăng ký email.</div>
            ) : (
              <div className="space-y-3">
                {filteredSubscribers.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-[#F8F1EA] border border-[#E7D8CC] p-4 flex items-start justify-between gap-4 flex-wrap hover:shadow-2xs transition"
                  >
                    <div>
                      <h3 className="text-[20px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">{item.full_name || "Khách hàng"}</h3>
                      <p className="mt-0.5 text-[13px] font-['Inter']! text-[#523C37]">{item.email}</p>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-['Inter']! uppercase tracking-[0.18em] text-[#B58F6F]">
                        {item.source}
                      </div>
                      <p className="mt-1 text-[11px] font-['Inter']! text-[#664E48]">{formatDate(item.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
