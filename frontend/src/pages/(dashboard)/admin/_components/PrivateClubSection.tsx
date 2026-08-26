import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { CourseRegistrationModal, type CourseDetailInfo } from "../../../../components/CourseRegistrationModal";

interface ClubCardItem {
  id: number;
  title: string;
  subtitle?: string;
  location: string;
  date: string;
  image: string;
  description: string;
  badge?: string;
  lumaUrl?: string;
}

const clubCards: ClubCardItem[] = [
  {
    id: 1,
    title: "Conviction 2026 — Global Web3 & On-Chain Summit",
    subtitle: "Welcome to Conviction 2026",
    location: "HCMC, Viet Nam",
    date: "14 - 15 August 2026",
    image: "/admin/card-event-01.png",
    badge: "Private Club Exclusive",
    lumaUrl: "https://lu.ma/conviction-2026",
    description:
      "Hội nghị thượng đỉnh quy tụ các quỹ đầu tư mạo hiểm hàng đầu, nhà sáng lập Web3 và các đối tác tài chính quốc tế. Thành viên On-Chainpass Private Club được dành riêng vị trí VIP tại khán phòng chính, vé mời tham dự tiệc tối Private VIP Dinner và quyền tiếp cận hệ sinh thái đối tác chiến lược.",
  },
  {
    id: 2,
    title: "CEO Summit Seoul 2026 — Capital & Innovation",
    subtitle: "CEO Summit",
    location: "Seoul, Korea",
    date: "28 - 29 October 2026",
    image: "/admin/card-event-02.png",
    badge: "Global Executive",
    lumaUrl: "https://lu.ma/ceo-summit-seoul",
    description:
      "Diễn đàn cấp cao kết nối các nhà hoạch định chiến lược, CEO tập đoàn công nghệ và định chế tài chính tại Seoul. Thảo luận chuyên sâu về cấu trúc vốn xuyên biên giới, giải pháp thanh khoản On-Chain và chiến lược mở rộng thị trường Đông Á.",
  },
  {
    id: 3,
    title: "The St. Regis Doha — Institutional Capital Roundtable",
    subtitle: "Private Roundtable",
    location: "Doha, Qatar",
    date: "12 November 2026",
    image: "/admin/private/private-03.png",
    badge: "Private Roundtable",
    lumaUrl: "https://lu.ma/st-regis-doha",
    description:
      "Phiên thảo luận bàn tròn giới hạn tại The St. Regis Doha dành riêng cho các quỹ gia đình (Family Offices) và nhà đầu tư tổ chức Trung Đông. Khám phá các mô hình token hóa tài sản thực (RWA) và cơ chế dịch chuyển dòng vốn quốc tế.",
  },
  {
    id: 4,
    title: "Global Founders & Investors Gala 2026",
    subtitle: "Annual VIP Gala",
    location: "Singapore",
    date: "20 December 2026",
    image: "/admin/private/private-04.png",
    badge: "VIP Gala",
    lumaUrl: "https://lu.ma/founders-investors-gala",
    description:
      "Dạ tiệc thượng đỉnh cuối năm vinh danh những bước tiến đổi mới sáng tạo trong hạ tầng On-Chain. Đêm hội tụ hơn 200 đối tác chiến lược, quỹ đầu tư và thành viên On-Chainpass trong không gian sang trọng bậc nhất Singapore.",
  },
];

export const PrivateClubSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDraggingTrack, setIsDraggingTrack] = useState(false);
  const [isDraggingCards, setIsDraggingCards] = useState(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const [selectedClubCourse, setSelectedClubCourse] = useState<CourseDetailInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        const rawProgress = scrollLeft / maxScroll;
        setScrollProgress(Math.min(1, Math.max(0, rawProgress)));
      } else {
        setScrollProgress(0);
      }
    }
  };

  const handleTrackClickOrDrag = (clientX: number) => {
    if (!trackRef.current || !scrollRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = clickX / rect.width;
    const { scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      scrollRef.current.scrollLeft = ratio * maxScroll;
    }
  };

  const handleTrackMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingTrack(true);
    handleTrackClickOrDrag(e.clientX);
  };

  const handleCardsMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDraggingCards(true);
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleOpenCourseModal = (card: ClubCardItem) => {
    if (hasDraggedRef.current) return;
    setSelectedClubCourse({
      id: card.id,
      title: card.title,
      subtitle: card.subtitle,
      description: card.description,
      location: card.location,
      date: card.date,
      schedule: `${card.location} • ${card.date}`,
      badge: card.badge || "Private Club",
      thumbnail: card.image,
      banner: card.image,
      lumaUrl: card.lumaUrl,
    });
    setIsModalOpen(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingTrack) {
        handleTrackClickOrDrag(e.clientX);
      } else if (isDraggingCards && scrollRef.current) {
        const dx = e.clientX - startXRef.current;
        if (Math.abs(dx) > 5) {
          hasDraggedRef.current = true;
        }
        scrollRef.current.scrollLeft = startScrollLeftRef.current - dx;
      }
    };

    const handleMouseUp = () => {
      setIsDraggingTrack(false);
      setIsDraggingCards(false);
    };

    if (isDraggingTrack || isDraggingCards) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingTrack, isDraggingCards]);

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, []);

  return (
    <div className="bg-white rounded-3xl sm:rounded-[28px] p-4 sm:p-5 md:p-6 shadow-xs border border-[#eae0d5] overflow-hidden w-full min-w-0">
      <div className="flex items-center justify-between mb-4 sm:mb-5 select-none">
        <div className="flex items-center gap-2">
          <h2 className="text-[24px] sm:text-[28px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">
            Events
          </h2>
          <span className="hidden xs:inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F0E4D8] text-[#8C6246] text-[10px] font-['Inter']! font-semibold uppercase tracking-wider">
            Sự kiện
          </span>
        </div>

        <a
          href="#all"
          className="relative group font-['Inter']! text-[11px] font-medium! text-[#664E48] uppercase tracking-wider hover:text-stone-900 transition-colors duration-200 pb-0.5 inline-block"
        >
          <span>XEM TẤT CẢ</span>
          <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#664E48] transition-all duration-300 ease-out group-hover:w-full" />
        </a>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleCardsMouseDown}
        className={`flex gap-3 sm:gap-4 overflow-x-auto pb-2 pt-1 w-full max-w-full scrollbar-none min-w-0 touch-pan-x select-none ${isDraggingCards ? "cursor-grabbing" : "cursor-grab"
          }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {clubCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: index * 0.06 }}
            whileHover={{ y: -3 }}
            onClick={() => handleOpenCourseModal(card)}
            className="w-[260px] xs:w-[280px] sm:w-[320px] md:w-85 h-[230px] sm:h-[260px] md:h-[270px] shrink-0 relative rounded-[20px] sm:rounded-[22px] overflow-hidden group cursor-pointer shadow-xs border border-stone-200/50"
          >
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80";
              }}
            />

            {/* Top Right: Register button */}
            <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenCourseModal(card);
                }}
                className="bg-[#E09A30] hover:bg-[#d9941b] active:scale-95 text-white text-[10px] sm:text-[11px] font-['Inter']! font-medium! px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-md uppercase tracking-wider shadow-sm transition-all cursor-pointer block"
              >
                Đăng Ký
              </button>
            </div>

            {/* Top Left: Badge */}
            {card.badge && (
              <div className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 z-10">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[#F2E8E0] text-[9px] sm:text-[10px] font-['Inter']! font-medium border border-white/10">
                  {card.badge}
                </span>
              </div>
            )}

            {/* Bottom Info Glassmorphism Card */}
            <div className="absolute bottom-3 left-3 sm:bottom-3.5 sm:left-3.5 w-[88%] sm:w-[82%] p-3 sm:p-3.5 rounded-2xl sm:rounded-[18px] border border-white/15 flex flex-col gap-0.5 sm:gap-1 shadow-lg bg-[#523C37]/65 backdrop-blur-[12px]">
              <h3 className="text-[17px] sm:text-[19px] md:text-[20px] font-semibold! text-[#F2E8E0] leading-tight tracking-wide font-['Cormorant_Garamond']! line-clamp-1">
                {card.title}
              </h3>
              <div className="text-[9.5px] sm:text-[10.5px]! text-[#D6B599] font-medium! flex items-center gap-1.5 uppercase tracking-wider font-['Inter']! flex-wrap">
                <img src="/admin/private/icon-location.png" alt="Location Icon" className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[120px]">{card.location}</span>
                {card.date && (
                  <>
                    <span>•</span>
                    <span className="truncate">{card.date}</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Track */}
      <div className="mt-3 sm:mt-4 flex items-center">
        <div
          ref={trackRef}
          onMouseDown={handleTrackMouseDown}
          onTouchStart={(e) => handleTrackClickOrDrag(e.touches[0].clientX)}
          onTouchMove={(e) => handleTrackClickOrDrag(e.touches[0].clientX)}
          className="w-full h-2 bg-[#F2E8E0] rounded-full relative overflow-hidden cursor-pointer select-none"
        >
          <div
            className={`h-full bg-[#B58F6F] rounded-full absolute top-0 ${isDraggingTrack || isDraggingCards ? "transition-none" : "transition-all duration-150"
              }`}
            style={{
              width: "35%",
              left: `${scrollProgress * 65}%`,
            }}
          />
        </div>
      </div>

      {/* Course / Event Registration Modal */}
      <CourseRegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} course={selectedClubCourse} />
    </div>
  );
};
