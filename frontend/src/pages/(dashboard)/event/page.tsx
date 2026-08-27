import { motion } from "framer-motion";
import { Calendar, Filter, MapPin, Phone, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "../../../api/client";
import { PortalModal } from "../../../components";

interface EventRegistrationResponse {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  event_id: string;
  event_title: string;
  event_date: string;
  location: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface EventRegistrationItem {
  id: string;
  registrationCode: string;
  eventTitle: string;
  eventDate: string;
  location: string;
  registeredAt: string;
  status: string;
  notes: string;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
};

const mapEventRegistration = (item: EventRegistrationResponse): EventRegistrationItem => ({
  id: item.id,
  registrationCode: `#${item.id.slice(0, 8).toUpperCase()}`,
  eventTitle: item.event_title || "Sự kiện",
  eventDate: item.event_date || "Sắp diễn ra",
  location: item.location || "HCMC, Viet Nam",
  registeredAt: formatDate(item.created_at),
  status: item.status === "pending" ? "Đang chờ xác nhận" : item.status === "confirmed" ? "Đã xác nhận" : item.status || "Đã đăng ký",
  notes: item.notes || "--",
});

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [registrations, setRegistrations] = useState<EventRegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const { data } = await apiClient.get("/engagement/events/register");
        if (data.success && Array.isArray(data.data)) {
          setRegistrations(data.data.map((item: EventRegistrationResponse) => mapEventRegistration(item)));
        } else {
          setRegistrations([]);
        }
      } catch (fetchError: any) {
        setError(fetchError.response?.data?.message || "Không thể tải lịch sử đăng ký sự kiện.");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  const filteredRegistrations = registrations.filter(
    (item) =>
      item.registrationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4 border-b border-[#DCD0C5] pb-6 mb-8 select-none">
        <h1 className="font-['Cormorant_Garamond']! text-[36px] md:text-[40px] font-semibold! text-[#1B1A16] mb-2 leading-tight">Events</h1>

        <button
          type="button"
          onClick={() => setIsCallModalOpen(true)}
          className="bg-[#523C37] hover:bg-[#382b24] text-[#F2E8E0] px-5 py-3 rounded-lg font-['Inter']! text-[11px] sm:text-[12px] font-semibold tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
        >
          <Phone size={15} fill="currentColor" />
          <span>GỌI HOTLINE</span>
        </button>
      </div>

      <div className="flex items-center justify-between mb-2 flex-wrap gap-4 select-none">
        <h2 className="font-['Cormorant_Garamond']! text-[24px] font-semibold! text-[#1B1A16] mb-4">History</h2>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center bg-[#E5DBD2] rounded-full px-4 py-3 w-55 sm:w-65 border border-transparent focus-within:border-[#B58F6F] focus-within:bg-white transition-all shadow-2xs">
            <Search size={16} className="text-[#664E48] shrink-0" />
            <input
              type="text"
              placeholder="Search Events History..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none font-['Inter'] text-[12px] text-[#1B1A16] placeholder:text-[#664E48]/60 w-full ml-2"
            />
          </div>

          <button
            type="button"
            className="w-10 h-10 rounded-full bg-[#C8BBB0] hover:bg-[#E8D7C9] text-[#664E48] flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
            title="Filter History"
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto custom-scrollbar pt-4 pb-1">
        <div className="min-w-200">
          <div className="bg-[#E8D7C9] rounded-lg py-4 px-6 mb-1 grid grid-cols-6 gap-4 items-center text-center font-['Cormorant_Garamond']! text-[16px] sm:text-[18px] font-bold! text-[#1B1A16] border border-[#DFD3C7]/60 shadow-2xs select-none">
            <div>Mã đăng ký</div>
            <div className="text-left pl-2">Tên sự kiện</div>
            <div>Thời gian</div>
            <div>Địa điểm</div>
            <div>Ngày đăng ký</div>
            <div>Trạng thái</div>
          </div>

          <div className="flex flex-col gap-1">
            {loading && (
              <div className="bg-white rounded-2xl py-8 px-6 text-center font-['Inter']! text-[14px] text-[#664E48] shadow-2xs border border-[#F2E8E0]">
                Đang tải lịch sử đăng ký sự kiện...
              </div>
            )}

            {!loading && error && (
              <div className="bg-[#F8E4DD] rounded-2xl py-8 px-6 text-center font-['Inter']! text-[14px] text-[#9A4D3A] shadow-2xs border border-[#E9C6B8]">
                {error}
              </div>
            )}

            {!loading && !error && filteredRegistrations.length === 0 && (
              <div className="bg-white rounded-2xl py-8 px-6 text-center font-['Inter']! text-[14px] text-[#664E48] shadow-2xs border border-[#F2E8E0]">
                Chưa có sự kiện nào được đăng ký.
              </div>
            )}

            {!loading &&
              !error &&
              filteredRegistrations.map((item, index) => (
                <motion.div
                  key={item.id + index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className="bg-white rounded-2xl py-5 px-6 grid grid-cols-6 gap-4 items-center text-center font-['Inter']! text-[13px] sm:text-[15px] text-[#664E48] font-normal! shadow-2xs border border-[#F2E8E0] hover:shadow-xs transition-shadow select-none"
                >
                  <div className="font-semibold text-[#1B1A16]">{item.registrationCode}</div>
                  <div className="text-left pl-2 font-medium text-[#3C2A25] truncate" title={item.eventTitle}>
                    {item.eventTitle}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[12px] sm:text-[13px]">
                    <Calendar size={13} className="text-[#B58F6F] shrink-0" />
                    <span>{item.eventDate}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[12px] sm:text-[13px]">
                    <MapPin size={13} className="text-[#B58F6F] shrink-0" />
                    <span className="truncate max-w-35">{item.location}</span>
                  </div>
                  <div>{item.registeredAt}</div>
                  <div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                        item.status === "Đã xác nhận"
                          ? "bg-[#E3EDE5] text-[#2D7A46] border border-[#C5DEC9]"
                          : "bg-[#FDF3E7] text-[#B0762E] border border-[#F6DEBE]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 mt-8 select-none opacity-40 pointer-events-none">
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => setCurrentPage(page)}
            className={`w-8 h-8 rounded-full font-['Inter'] text-[13px] font-medium transition cursor-pointer flex items-center justify-center ${
              currentPage === page ? "bg-[#E5DBD2] text-[#1B1A16] shadow-2xs font-semibold" : "text-[#664E48] hover:bg-[#E8D7C9]/40"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

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
