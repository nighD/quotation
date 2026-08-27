import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../../api/client";
import { CourseRegistrationModal, type CourseDetailInfo } from "../../../../components/CourseRegistrationModal";

export interface ClubCardItem {
  id: string | number;
  title: string;
  subtitle?: string;
  location: string;
  date: string;
  image: string;
  fallbackImage?: string;
  description: string;
  badge?: string;
  lumaUrl?: string;
  status?: string;
  orderIndex?: number;
}

export const EventsSection: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDraggingTrack, setIsDraggingTrack] = useState(false);
  const [isDraggingCards, setIsDraggingCards] = useState(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const [cards, setCards] = useState<ClubCardItem[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set());
  const [registeredEventTitles, setRegisteredEventTitles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [selectedClubCourse, setSelectedClubCourse] = useState<CourseDetailInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEventsAndRegistrations = async () => {
      setLoading(true);
      try {
        const [eventsRes, regRes] = await Promise.allSettled([apiClient.get("/cms/events"), apiClient.get("/engagement/events/register")]);

        if (eventsRes.status === "fulfilled" && eventsRes.value.data?.success && Array.isArray(eventsRes.value.data.data)) {
          const mapped: ClubCardItem[] = eventsRes.value.data.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            location: item.location || "Địa điểm thông báo sau",
            date: item.date || "Sắp diễn ra",
            image: item.image || "/admin/card-event-01.png",
            fallbackImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
            description: item.description || "",
            badge: item.badge || "Private Club Exclusive",
            lumaUrl: item.luma_url || item.lumaUrl,
            status: item.status || "active",
            orderIndex: item.order_index ?? item.orderIndex ?? 0,
          }));
          setCards(mapped);
        }

        if (regRes.status === "fulfilled" && regRes.value.data?.success && Array.isArray(regRes.value.data.data)) {
          const ids = new Set<string>();
          const titles = new Set<string>();
          regRes.value.data.data.forEach((r: any) => {
            if (r.event_id) ids.add(String(r.event_id));
            if (r.event_title) titles.add(String(r.event_title).trim().toLowerCase());
          });
          setRegisteredEventIds(ids);
          setRegisteredEventTitles(titles);
        }
      } catch (err) {
        console.error("Failed to load events / registrations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventsAndRegistrations();
  }, []);

  const isCardRegistered = (card: ClubCardItem) => {
    return registeredEventIds.has(String(card.id)) || registeredEventTitles.has(card.title.trim().toLowerCase());
  };

  const refreshRegistrations = async () => {
    try {
      const { data } = await apiClient.get("/engagement/events/register");
      if (data.success && Array.isArray(data.data)) {
        const ids = new Set<string>();
        const titles = new Set<string>();
        data.data.forEach((r: any) => {
          if (r.event_id) ids.add(String(r.event_id));
          if (r.event_title) titles.add(String(r.event_title).trim().toLowerCase());
        });
        setRegisteredEventIds(ids);
        setRegisteredEventTitles(titles);
      }
    } catch (err) {
      console.error("Failed to refresh event registrations:", err);
    }
  };

  const handleRegistrationSuccess = (cardId?: string | number, cardTitle?: string) => {
    if (cardId) {
      setRegisteredEventIds((prev) => new Set([...prev, String(cardId)]));
    }
    if (cardTitle) {
      setRegisteredEventTitles((prev) => new Set([...prev, cardTitle.trim().toLowerCase()]));
    }
    refreshRegistrations();
  };

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
  }, [cards]);

  return (
    <div className="bg-white rounded-3xl sm:rounded-[28px] p-4 sm:p-5 md:p-6 shadow-xs border border-[#eae0d5] overflow-hidden w-full min-w-0">
      <div className="flex items-center justify-between mb-4 sm:mb-5 select-none">
        <div className="flex items-center gap-2">
          <h2 className="text-[24px] sm:text-[28px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">Events</h2>
          <span className="hidden xs:inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F0E4D8] text-[#8C6246] text-[10px] font-['Inter']! font-semibold uppercase tracking-wider">
            Sự kiện
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate("/event")}
          className="relative group font-['Inter']! text-[11px] font-medium! text-[#664E48] uppercase tracking-wider hover:text-stone-900 transition-colors duration-200 pb-0.5 inline-block cursor-pointer"
        >
          <span>XEM TẤT CẢ</span>
          <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#664E48] transition-all duration-300 ease-out group-hover:w-full" />
        </button>
      </div>

      {loading ? (
        <div className="flex gap-3 sm:gap-4 overflow-hidden pb-2 pt-1 w-full">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-[260px] xs:w-[280px] sm:w-[320px] md:w-85 h-[230px] sm:h-[260px] md:h-[270px] shrink-0 rounded-[20px] bg-[#F2E8E0] animate-pulse"
            />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-[#664E48] text-sm font-['Inter']">Hiện chưa có sự kiện nào sắp tới.</div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleCardsMouseDown}
          className={`flex gap-3 sm:gap-4 overflow-x-auto pb-2 pt-1 w-full max-w-full scrollbar-none min-w-0 touch-pan-x select-none ${
            isDraggingCards ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {cards.map((card, index) => {
            const isRegistered = isCardRegistered(card);

            return (
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
                    (e.target as HTMLImageElement).src =
                      card.fallbackImage || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80";
                  }}
                />

                {/* Top Right: Register button or Registered Badge */}
                <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-10">
                  {isRegistered ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCourseModal(card);
                      }}
                      className="bg-[#2D7A46] hover:bg-[#246639] active:scale-95 text-white text-[10px] sm:text-[11px] font-['Inter']! font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>ĐÃ ĐĂNG KÝ</span>
                      <span>✓</span>
                    </button>
                  ) : (
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
                  )}
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
            );
          })}
        </div>
      )}

      {/* Progress Track */}
      {!loading && cards.length > 0 && (
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
      )}

      {/* Course / Event Registration Modal */}
      <CourseRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={selectedClubCourse}
        isRegistered={
          selectedClubCourse
            ? isCardRegistered({
                id: selectedClubCourse.id || "",
                title: selectedClubCourse.title || "",
              } as ClubCardItem)
            : false
        }
        onSuccess={() => handleRegistrationSuccess(selectedClubCourse?.id, selectedClubCourse?.title)}
      />
    </div>
  );
};

// Export backward compatibility alias
export const PrivateClubSection = EventsSection;
