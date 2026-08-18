import { motion } from "framer-motion";
import { Maximize2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../../api/client";

const FilledLock = ({ size = 15, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path d="M6.5 10V7a5.5 5.5 0 0 1 11 0v3" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 9.5C3.17157 9.5 2.5 10.1716 2.5 11V19.5C2.5 20.8807 3.61929 22 5 22H19C20.3807 22 21.5 20.8807 21.5 19.5V11C21.5 10.1716 20.8284 9.5 20 9.5H4ZM12 13C11.1716 13 10.5 13.6716 10.5 14.5C10.5 15.15 10.91 15.7 11.48 15.91L11.1 18.2C11.04 18.57 11.33 18.9 11.7 18.9H12.3C12.67 18.9 12.96 18.57 12.9 18.2L12.52 15.91C13.09 15.7 13.5 15.15 13.5 14.5C13.5 13.6716 12.8284 13 12 13Z"
      fill="currentColor"
    />
  </svg>
);

interface ReportItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  description: string;
  isDark?: boolean;
  isLocked?: boolean;
}

const getArticleRequiredRole = (article: any): string => {
  if (!article) return "free";
  if (article.required_role) return article.required_role;
  if (!article.blocks) return "free";

  try {
    const blocks = typeof article.blocks === "string" ? JSON.parse(article.blocks) : article.blocks;
    if (Array.isArray(blocks)) {
      const pdfBlock = blocks.find((block: any) => block.type === "pdf");
      if (pdfBlock?.activeRole) {
        return pdfBlock.activeRole;
      }
    }
  } catch (error) {
    console.error("Failed to parse article blocks", error);
  }

  return "free";
};

const formatArticleDate = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return dateStr;
  }
};

export const ReportSection: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDraggingTrack, setIsDraggingTrack] = useState(false);
  const [isDraggingCards, setIsDraggingCards] = useState(false);
  const [reportItems, setReportItems] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const startYRef = useRef(0);
  const startScrollTopRef = useRef(0);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await apiClient.get("/cms/articles?page=1&page_size=10");
        if (data.success && Array.isArray(data.data)) {
          const items = data.data.map((article: any, index: number) => ({
            id: article.id,
            slug: article.slug || article.id,
            title: article.title,
            date: formatArticleDate(article.created_at),
            description:
              article.description && article.description.trim().length > 0
                ? article.description
                : "Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits.",
            isDark: index % 2 === 1,
            isLocked: article.required_role ? article.required_role !== "free" : getArticleRequiredRole(article) !== "free",
          }));
          setReportItems(items);
        }
      } catch (fetchError) {
        console.error("Failed to fetch reports", fetchError);
        setError("Failed to load reports.");
        setReportItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const showScrollbar = reportItems.length > 4;

  const handleScroll = () => {
    if (scrollRef.current && showScrollbar) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll > 0) {
        setScrollProgress(Math.min(1, Math.max(0, scrollTop / maxScroll)));
      } else {
        setScrollProgress(0);
      }
    }
  };

  const handleTrackClickOrDrag = (clientY: number) => {
    if (!trackRef.current || !scrollRef.current || !showScrollbar) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickY = Math.max(0, Math.min(clientY - rect.top, rect.height));
    const ratio = clickY / rect.height;
    const { scrollHeight, clientHeight } = scrollRef.current;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll > 0) {
      scrollRef.current.scrollTop = ratio * maxScroll;
    }
  };

  const handleTrackMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingTrack(true);
    handleTrackClickOrDrag(e.clientY);
  };

  const handleCardsMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current || !showScrollbar) return;
    setIsDraggingCards(true);
    startYRef.current = e.clientY;
    startScrollTopRef.current = scrollRef.current.scrollTop;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingTrack) {
        handleTrackClickOrDrag(e.clientY);
      } else if (isDraggingCards && scrollRef.current && showScrollbar) {
        const dy = e.clientY - startYRef.current;
        scrollRef.current.scrollTop = startScrollTopRef.current - dy;
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
  }, [isDraggingTrack, isDraggingCards, showScrollbar]);

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [reportItems]);

  return (
    <div className="w-full bg-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 md:p-6 shadow-sm flex flex-col h-full border border-[#EAE0D6]">
      <div className="flex items-center justify-between mb-4 sm:mb-5 select-none">
        <h2 className="text-[24px] sm:text-[28px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">Report</h2>
        <button
          type="button"
          onClick={() => navigate("/report")}
          className="relative group font-['Inter']! text-[11px] font-medium! text-[#664E48] uppercase tracking-wider hover:text-stone-900 transition-colors duration-200 pb-0.5 inline-block cursor-pointer"
        >
          <span>XEM TẤT CẢ</span>
          <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#664E48] transition-all duration-300 ease-out group-hover:w-full" />
        </button>
      </div>

      <div className="flex-1 min-h-0 flex gap-2.5 sm:gap-3 relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={showScrollbar ? handleCardsMouseDown : undefined}
          className={`flex-1 flex flex-col gap-3 sm:gap-4 ${
            showScrollbar
              ? `overflow-y-auto pr-1 max-h-[500px] xl:max-h-[560px] 2xl:max-h-[600px] scrollbar-none min-h-0 select-none ${
                  isDraggingCards ? "cursor-grabbing" : "cursor-grab"
                }`
              : "overflow-visible select-none"
          }`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="rounded-2xl bg-[#F5ECE5]/60 animate-pulse p-5 min-h-28 flex flex-col justify-between">
                  <div className="h-5 bg-[#E2D2C4]/60 rounded-md w-2/3 mb-2" />
                  <div className="h-3 bg-[#E2D2C4]/40 rounded-md w-1/3 mb-3" />
                  <div className="h-3 bg-[#E2D2C4]/40 rounded-md w-full" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && <div className="rounded-2xl bg-[#F9ECE8] p-5 text-[12px] font-['Inter']! text-[#9A4D3A]">{error}</div>}

          {!loading &&
            !error &&
            reportItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                onClick={() => navigate(`/report/${item.slug}`)}
                className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative transition-shadow shadow-xs ${
                  item.isDark ? "bg-[#B58F6F] text-white" : "bg-[#E8D7C9]"
                } cursor-pointer`}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/report/${item.slug}`);
                  }}
                  className={`absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center hover:opacity-90 transition cursor-pointer ${
                    item.isDark ? "bg-[#E8D7C9] text-[#3D281F]" : "bg-[#664E48] text-white"
                  }`}
                >
                  {item.isLocked ? <FilledLock size={15} /> : <Maximize2 size={15} />}
                </button>

                <div className="pr-10">
                  <h3
                    className={`font-['Cormorant_Garamond']! text-[19px] sm:text-[21px] md:text-[22px] font-semibold! leading-snug ${
                      item.isDark ? "text-[#F2E8E0]" : "text-[#664E48]"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-[10px] font-normal! font-['Inter']! uppercase tracking-wider mt-1 ${item.isDark ? "text-[#F2E8E0]/70" : "text-[#B58F6F]"}`}
                  >
                    {item.date}
                  </p>

                  <div className={`h-px w-full my-2.5 sm:my-3 ${item.isDark ? "bg-[#F2E8E0]/30" : "bg-[#664E48]/25"}`} />

                  <p
                    className={`text-[12px] font-normal! font-['Inter']! leading-relaxed line-clamp-3 ${item.isDark ? "text-[#F2E8E0]/90" : "text-[#523C37]"}`}
                  >
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}

          {!loading && !error && reportItems.length === 0 && (
            <div className="rounded-2xl bg-[#F5ECE5] p-5 text-[12px] font-['Inter']! text-[#664E48]">No reports available.</div>
          )}
        </div>

        {showScrollbar && (
          <div className="flex items-center justify-center h-full py-1">
            <div
              ref={trackRef}
              onMouseDown={handleTrackMouseDown}
              onTouchStart={(e) => handleTrackClickOrDrag(e.touches[0].clientY)}
              onTouchMove={(e) => handleTrackClickOrDrag(e.touches[0].clientY)}
              className="w-2 h-full bg-[#F2E8E0] rounded-full relative overflow-hidden cursor-pointer select-none"
            >
              <div
                className={`w-full bg-[#B58F6F] rounded-full absolute left-0 ${
                  isDraggingTrack || isDraggingCards ? "transition-none" : "transition-all duration-150"
                }`}
                style={{
                  height: "35%",
                  top: `${scrollProgress * 65}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
