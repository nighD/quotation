import { motion } from "framer-motion";
import { Filter, Phone, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../../../api/client";
import { PortalModal } from "../../../components";

interface BookingRequestItem {
  id: string;
  user_id?: string;
  email?: string;
  full_name?: string;
  booking_type?: string;
  booking_title?: string;
  status?: string;
  source?: string;
  note?: string;
  created_at: string;
  updated_at?: string;
}

const formatOrderCode = (id: string) => {
  if (!id) return "--";
  return `#${id.slice(0, 8).toUpperCase()}`;
};

const formatDate = (value: string) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const getStatusBadge = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
    case "approved":
      return {
        label: "Đã xác nhận",
        className: "bg-[#E3EDE5] text-[#2D7A46] border border-[#C5DEC9]",
      };
    case "cancelled":
    case "rejected":
      return {
        label: "Đã hủy",
        className: "bg-[#F8E4DD] text-[#9A4D3A] border border-[#E9C6B8]",
      };
    case "pending":
    case "waiting":
    default:
      return {
        label: "Đang chờ xác nhận",
        className: "bg-[#FDF3E7] text-[#B0762E] border border-[#F6DEBE]",
      };
  }
};

export default function BookingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [bookings, setBookings] = useState<BookingRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = 8;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await apiClient.get("/engagement/booking-requests/me");
        if (data.success && Array.isArray(data.data)) {
          setBookings(data.data);
        } else {
          setBookings([]);
        }
      } catch (fetchError: any) {
        setError(fetchError.response?.data?.message || "Không thể tải lịch sử đăng ký khóa học.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const orderCode = formatOrderCode(b.id).toLowerCase();
      const courseTitle = (b.booking_title || b.booking_type || "").toLowerCase();
      const note = (b.note || "").toLowerCase();
      const statusInfo = getStatusBadge(b.status).label.toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch = !q || orderCode.includes(q) || courseTitle.includes(q) || note.includes(q) || statusInfo.includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && (!b.status || b.status === "pending" || b.status === "waiting")) ||
        (statusFilter === "confirmed" && (b.status === "confirmed" || b.status === "approved")) ||
        (statusFilter === "cancelled" && (b.status === "cancelled" || b.status === "rejected"));

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  // Reset pagination when search query or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4 border-b border-[#DCD0C5] pb-6 mb-8 select-none">
        <div>
          <h1 className="font-['Cormorant_Garamond']! text-[36px] md:text-[40px] font-semibold! text-[#1B1A16] mb-1 leading-tight">Booking</h1>
          <p className="font-['Inter']! text-[13px] text-[#664E48] font-normal!">Theo dõi danh sách và tình trạng các khóa học bạn đã đăng ký</p>
        </div>

        <button
          type="button"
          onClick={() => setIsCallModalOpen(true)}
          className="bg-[#523C37] hover:bg-[#382b24] text-[#F2E8E0] px-5 py-3 rounded-lg font-['Inter']! text-[11px] sm:text-[12px] font-semibold tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
        >
          <Phone size={15} fill="currentColor" />
          <span>GỌI HOTLINE</span>
        </button>
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-4 select-none">
        <h2 className="font-['Cormorant_Garamond']! text-[24px] font-semibold! text-[#1B1A16]">History ({filteredBookings.length})</h2>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex items-center bg-[#E5DBD2] rounded-full px-4 py-2.5 w-60 sm:w-72 border border-transparent focus-within:border-[#B58F6F] focus-within:bg-white transition-all shadow-2xs">
            <Search size={16} className="text-[#664E48] shrink-0" />
            <input
              type="text"
              placeholder="Tìm mã đăng ký, khóa học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none font-['Inter'] text-[12.5px] text-[#1B1A16] placeholder:text-[#664E48]/60 w-full ml-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={15} className="text-[#8C6246]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#E5DBD2] border border-transparent focus:border-[#B58F6F] focus:bg-white rounded-xl px-3 py-2 text-[12px] font-['Inter']! text-[#523C37] outline-none cursor-pointer transition shadow-2xs"
            >
              <option value="all">Tất cả tình trạng</option>
              <option value="pending">Đang chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto custom-scrollbar pt-2 pb-1">
        <div className="min-w-[700px]">
          <div className="bg-[#E8D7C9] rounded-xl py-3.5 px-6 mb-2 grid grid-cols-12 gap-4 items-center text-center font-['Cormorant_Garamond']! text-[17px] sm:text-[19px] font-bold! text-[#1B1A16] border border-[#DFD3C7]/60 shadow-2xs select-none">
            <div className="col-span-3 text-center sm:text-left sm:pl-2">Mã đăng ký</div>
            <div className="col-span-4 text-left">Khóa học</div>
            <div className="col-span-3 text-center">Ngày Đăng ký</div>
            <div className="col-span-2 text-center">Tình Trạng</div>
          </div>

          <div className="flex flex-col gap-2">
            {loading && (
              <div className="bg-white rounded-2xl py-8 px-6 text-center font-['Inter']! text-[14px] text-[#664E48] shadow-2xs border border-[#F2E8E0]">
                Đang tải lịch sử đăng ký...
              </div>
            )}

            {!loading && error && (
              <div className="bg-[#F8E4DD] rounded-2xl py-8 px-6 text-center font-['Inter']! text-[14px] text-[#9A4D3A] shadow-2xs border border-[#E9C6B8]">
                {error}
              </div>
            )}

            {!loading && !error && filteredBookings.length === 0 && (
              <div className="bg-white rounded-2xl py-8 px-6 text-center font-['Inter']! text-[14px] text-[#664E48] shadow-2xs border border-[#F2E8E0]">
                {searchQuery || statusFilter !== "all" ? "Không tìm thấy đăng ký khóa học nào phù hợp." : "Chưa có yêu cầu đăng ký khóa học nào được lưu."}
              </div>
            )}

            {!loading &&
              !error &&
              paginatedBookings.map((booking, index) => {
                const statusBadge = getStatusBadge(booking.status);
                return (
                  <motion.div
                    key={booking.id || index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="bg-white rounded-2xl py-5 px-6 grid grid-cols-12 gap-4 items-center font-['Inter']! text-[13.5px] sm:text-[14.5px] text-[#664E48] font-normal shadow-2xs border border-[#F2E8E0] hover:shadow-xs hover:border-[#E8D7C9] transition-all select-none"
                  >
                    <div className="col-span-3 text-center sm:text-left sm:pl-2 font-medium text-[#1B1A16]">{formatOrderCode(booking.id)}</div>
                    <div className="col-span-4 text-left min-w-0">
                      <div className="font-medium text-[#1B1A16] line-clamp-2" title={booking.booking_title || booking.booking_type}>
                        {booking.booking_title || booking.booking_type || "Khóa học chuyên sâu"}
                      </div>
                      {booking.note && (
                        <div className="text-[12px] text-[#8C6246] mt-0.5 line-clamp-1 italic" title={booking.note}>
                          Ghi chú: {booking.note}
                        </div>
                      )}
                    </div>
                    <div className="col-span-3 text-center text-[#664E48]">{formatDate(booking.created_at)}</div>
                    <div className="col-span-2 flex justify-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[11.5px] sm:text-[12px] font-medium tracking-wide ${statusBadge.className}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 select-none">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-full font-['Inter'] text-[13px] font-medium transition cursor-pointer flex items-center justify-center ${
                currentPage === page ? "bg-[#523C37] text-white shadow-xs font-semibold" : "text-[#664E48] hover:bg-[#E8D7C9]/60"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Call Confirmation Modal */}
      <PortalModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        width="max-w-xs sm:max-w-sm"
        className="text-center"
        showCloseButton={true}
      >
        <div className="text-center pt-1 pb-1">
          <div className="w-12 h-12 rounded-2xl bg-[#F0E4D8] border border-[#E6D7CB] text-[#8C6246] flex items-center justify-center mx-auto mb-3.5 shadow-xs">
            <Phone size={20} />
          </div>
          <h3 className="font-['Cormorant_Garamond']! text-[24px] sm:text-[26px] font-semibold! text-[#523C37] mb-2">Gọi chăm sóc khách hàng?</h3>
          <p className="font-['Inter']! text-[12.5px] text-[#664E48] mb-6 leading-relaxed">
            Kết nối trực tiếp với đội ngũ tư vấn viên để được hỗ trợ nhanh nhất.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCallModalOpen(false)}
              className="flex-1 bg-[#EADCCF] hover:bg-[#dfcfc0] text-[#523C37] font-['Inter']! text-[12px] font-medium! tracking-wider uppercase py-3 rounded-xl transition cursor-pointer active:scale-95"
            >
              QUAY LẠI
            </button>
            <a
              href="tel:19001000"
              onClick={() => setIsCallModalOpen(false)}
              className="flex-1 bg-[#523C37] hover:bg-[#382b24] text-[#F2E8E0] font-['Inter']! text-[12px] font-medium! tracking-wider uppercase py-3 rounded-xl transition cursor-pointer active:scale-95 text-center shadow-md"
            >
              GỌI
            </a>
          </div>
        </div>
      </PortalModal>
    </div>
  );
}
