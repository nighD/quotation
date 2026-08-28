import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { apiClient } from "../../../../api/client";

const CalendarFilledIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5 text-[#B58F6F]" }) => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.5 1a.75.75 0 0 1 .75.75V3h5.5V1.75a.75.75 0 0 1 1.5 0V3H13.5A2.5 2.5 0 0 1 16 5.5v7A2.5 2.5 0 0 1 13.5 15h-11A2.5 2.5 0 0 1 0 12.5v-7A2.5 2.5 0 0 1 2.5 3h1.25V1.75A.75.75 0 0 1 4.5 1zM4 9.5a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1z"
    />
  </svg>
);

const MapPinFilledIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5 text-[#B58F6F]" }) => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 1a5.5 5.5 0 0 0-5.5 5.5c0 4.125 5.5 9.5 5.5 9.5s5.5-5.375 5.5-9.5A5.5 5.5 0 0 0 8 1zm0 3.75a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5z"
    />
  </svg>
);

export interface EventItemData {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  image?: string;
}

export interface EventSectionProps {
  title?: string;
  events?: EventItemData[];
  onDeleteAll?: () => void;
  onRemind?: (event: EventItemData) => void;
  onJoin?: (event: EventItemData) => void;
  joiningEventId?: string | null;
  joinedEventIds?: string[];
}

export const EventSection: React.FC<EventSectionProps> = ({
  title = "New Letter",
  events: propEvents,
  onDeleteAll,
  onJoin,
  joiningEventId: propJoiningId,
  joinedEventIds: propJoinedIds,
}) => {
  const [internalEvents, setInternalEvents] = useState<EventItemData[]>([]);
  const [loading, setLoading] = useState(false);
  const [internalJoiningId, setInternalJoiningId] = useState<string | null>(null);
  const [internalJoinedIds, setInternalJoinedIds] = useState<string[]>([]);
  const [isDeleted, setIsDeleted] = useState(false);

  // Fetch newsletters / events from CMS
  useEffect(() => {
    if (propEvents && propEvents.length > 0) {
      setInternalEvents(propEvents);
      return;
    }

    const fetchNewsletterData = async () => {
      setLoading(true);
      try {
        let loadedItems: EventItemData[] = [];

        // Fetch newsletters from /cms/newsletters
        try {
          const res = await apiClient.get("/cms/newsletters");
          const dataList = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
          if (dataList.length > 0) {
            loadedItems = dataList.map((item: any) => ({
              id: item.id,
              title: item.title,
              date: item.date || "Sắp diễn ra",
              location: item.location || "HCMC, Viet Nam",
              description: item.description,
              image: item.image,
            }));
          }
        } catch (_err) {
          // Fallback to /cms/events if needed
        }

        if (loadedItems.length === 0) {
          try {
            const { data } = await apiClient.get("/cms/events");
            const dataList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
            if (dataList.length > 0) {
              loadedItems = dataList.map((item: any) => ({
                id: item.id,
                title: item.title,
                date: item.date || "Sắp diễn ra",
                location: item.location || "HCMC, Viet Nam",
                description: item.description,
                image: item.image,
              }));
            }
          } catch (_err) {}
        }

        setInternalEvents(loadedItems);

        // Fetch user's registered newsletter IDs if not provided via props
        if (!propJoinedIds) {
          try {
            const regRes = await apiClient.get("/engagement/newsletters/my-registrations");
            const regList = Array.isArray(regRes.data?.data) ? regRes.data.data : Array.isArray(regRes.data) ? regRes.data : [];
            const ids = regList.map((r: any) => r.newsletter_id || r.event_id || r.id).filter(Boolean);
            setInternalJoinedIds(ids);
          } catch (_err) {
            try {
              const eventRegRes = await apiClient.get("/engagement/events/register");
              const regList = Array.isArray(eventRegRes.data?.data) ? eventRegRes.data.data : Array.isArray(eventRegRes.data) ? eventRegRes.data : [];
              const ids = regList.map((r: any) => r.event_id || r.id).filter(Boolean);
              setInternalJoinedIds(ids);
            } catch (_e) {}
          }
        }
      } catch (err) {
        console.error("Failed to load newsletter items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletterData();
  }, [propEvents, propJoinedIds]);

  const activeEvents = propEvents ?? internalEvents;
  const joinedEventIds = propJoinedIds ?? internalJoinedIds;
  const joiningEventId = propJoiningId ?? internalJoiningId;

  const handleJoin = async (event: EventItemData) => {
    if (onJoin) {
      onJoin(event);
      return;
    }

    setInternalJoiningId(event.id);
    try {
      try {
        await apiClient.post("/engagement/newsletters/register", {
          newsletter_id: event.id,
          newsletter_title: event.title,
          newsletter_date: event.date,
          location: event.location,
          note: "",
        });
      } catch (_err) {
        await apiClient.post("/engagement/events/register", {
          event_id: event.id,
          event_title: event.title,
          event_date: event.date,
          location: event.location,
        });
      }

      setInternalJoinedIds((prev) => (prev.includes(event.id) ? prev : [...prev, event.id]));
    } catch (err) {
      console.error("Failed to register newsletter item:", err);
    } finally {
      setInternalJoiningId(null);
    }
  };

  const handleDelete = () => {
    setIsDeleted(true);
    if (onDeleteAll) {
      onDeleteAll();
    }
  };

  if (isDeleted) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl sm:rounded-[28px] p-4 sm:p-6 md:p-7 shadow-sm border border-[#EBE1D5] relative">
      <button
        type="button"
        onClick={handleDelete}
        className="absolute top-5 right-5 sm:top-6 sm:right-6 font-['Inter']! text-[11px] font-medium text-[#6C5345] uppercase tracking-wider hover:text-stone-900 transition-colors duration-200 cursor-pointer"
      >
        XOÁ
      </button>

      <h2 className="text-center font-['Cormorant_Garamond']! text-[24px] sm:text-[28px] md:text-[30px] font-semibold! text-[#1B1A16] mb-4 sm:mb-5 tracking-tight">
        {title}
      </h2>

      {loading ? (
        <div className="py-6 text-center text-xs font-['Inter'] text-[#8C6246]">Đang tải dữ liệu...</div>
      ) : activeEvents.length === 0 ? (
        <div className="py-6 text-center text-xs font-['Inter'] text-[#8C6246]">Không có bản tin hoặc sự kiện mới.</div>
      ) : (
        <div
          className="flex flex-col border-t border-[#EAE0D6] max-h-[245px] sm:max-h-[260px] overflow-y-auto pr-1.5 select-none"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#D9C8BA transparent",
          }}
        >
          {activeEvents.map((event, index) => {
            const isJoining = joiningEventId === event.id;
            const isJoined = joinedEventIds.includes(event.id);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="py-3.5 sm:py-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-[#EAE0D6]"
              >
                <div className="flex flex-col gap-2 min-w-0">
                  <h3 className="font-['Inter']! text-[13px] sm:text-[14px] font-normal! text-[#523C37]">{event.title}</h3>
                  <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-[#B58F6F] font-['Inter']! font-normal! uppercase flex-wrap">
                    <span className="flex items-center gap-1">
                      <CalendarFilledIcon className="w-3.5 h-3.5 text-[#B58F6F]" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPinFilledIcon className="w-3.5 h-3.5 text-[#B58F6F]" />
                      {event.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleJoin(event)}
                    disabled={isJoining || isJoined}
                    className={`text-white text-[10px] sm:text-[11px] font-['Inter']! font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition uppercase tracking-wider cursor-pointer active:scale-95 ${
                      isJoined ? "bg-[#2D7A46] cursor-default font-semibold" : isJoining ? "bg-[#9E7C62] cursor-wait" : "bg-[#B08461] hover:bg-[#9e7553]"
                    }`}
                  >
                    {isJoined ? "ĐÃ ĐĂNG KÝ ✓" : isJoining ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const NewLetterSection = EventSection;

