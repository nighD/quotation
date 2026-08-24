import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { CourseRegistrationModal, type CourseDetailInfo } from "../../../../components/CourseRegistrationModal";

interface ClubCardItem {
  id: number;
  title: string;
  location: string;
  image: string;
}

const clubCards: ClubCardItem[] = [
  {
    id: 1,
    title: "Chương trình thí điểm...",
    location: "HCMC, Viet Nam",
    image: "/admin/card-event-01.png",
  },
  {
    id: 2,
    title: "CEO Summit",
    location: "Seoul, korean",
    image: "/admin/card-event-02.png",
  },
  {
    id: 3,
    title: "The St.Regis Doha",
    location: "LOCATION ADDRESS HERE",
    image: "/admin/private/private-03.png",
  },
  {
    id: 4,
    title: "The St.Regis Doha",
    location: "LOCATION ADDRESS HERE",
    image: "/admin/private/private-04.png",
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
      description: `Chương trình đặc quyền dành cho thành viên Private Club tại ${card.location}. Vui lòng điền thông tin để ban tổ chức chuẩn bị chu đáo nhất.`,
      schedule: card.location,
      badge: "Private Club",
      thumbnail: card.image,
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
    <div className="bg-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 md:p-6 shadow-xs border border-[#eae0d5] overflow-hidden w-full min-w-0">
      <div className="flex items-center justify-between mb-4 sm:mb-5 select-none">
        <h2 className="text-[24px] sm:text-[28px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">Private Club</h2>
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
        className={`flex gap-3 sm:gap-4 overflow-x-auto pb-2 pt-1 w-full max-w-full scrollbar-none min-w-0 touch-pan-x select-none ${
          isDraggingCards ? "cursor-grabbing" : "cursor-grab"
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

            <div className="absolute bottom-3 left-3 sm:bottom-3.5 sm:left-3.5 w-[85%] sm:w-[80%] p-3 sm:p-4 rounded-2xl sm:rounded-[18px] border border-white/10 flex flex-col gap-0.5 sm:gap-1 shadow-lg bg-[#523C37]/45 backdrop-blur-[12px]">
              <h3 className="text-[20px] sm:text-[22px] md:text-[24px] font-semibold! text-[#F2E8E0] leading-tight tracking-wide font-['Cormorant_Garamond']!">
                {card.title}
              </h3>
              <p className="text-[10px] sm:text-[11px]! text-[#B58F6F] font-medium! flex items-center gap-1.5 uppercase tracking-wider font-['Inter']!">
                <img src="/admin/private/icon-location.png" alt="Location Icon" className="w-3 h-3" />
                <span className="truncate">{card.location}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 sm:mt-4 flex items-center">
        <div
          ref={trackRef}
          onMouseDown={handleTrackMouseDown}
          onTouchStart={(e) => handleTrackClickOrDrag(e.touches[0].clientX)}
          onTouchMove={(e) => handleTrackClickOrDrag(e.touches[0].clientX)}
          className="w-full h-2 bg-[#F2E8E0] rounded-full relative overflow-hidden cursor-pointer select-none"
        >
          <div
            className={`h-full bg-[#B58F6F] rounded-full absolute top-0 ${
              isDraggingTrack || isDraggingCards ? "transition-none" : "transition-all duration-150"
            }`}
            style={{
              width: "35%",
              left: `${scrollProgress * 65}%`,
            }}
          />
        </div>
      </div>

      {/* Course Registration Modal */}
      <CourseRegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} course={selectedClubCourse} />
    </div>
  );
};
