import React from "react";
import { motion } from "framer-motion";

const CalendarFilledIcon: React.FC<{ className?: string }> = ({
  className = "w-3.5 h-3.5 text-[#B58F6F]",
}) => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.5 1a.75.75 0 0 1 .75.75V3h5.5V1.75a.75.75 0 0 1 1.5 0V3H13.5A2.5 2.5 0 0 1 16 5.5v7A2.5 2.5 0 0 1 13.5 15h-11A2.5 2.5 0 0 1 0 12.5v-7A2.5 2.5 0 0 1 2.5 3h1.25V1.75A.75.75 0 0 1 4.5 1zM4 9.5a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1z"
    />
  </svg>
);

const MapPinFilledIcon: React.FC<{ className?: string }> = ({
  className = "w-3.5 h-3.5 text-[#B58F6F]",
}) => (
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

const DEFAULT_EVENTS: EventItemData[] = [
  {
    id: "1",
    title: "Global Summit 2027",
    date: "SUN 17 MAY 15:29",
    location: "LOCATION ADDRESS HERE",
  },
  {
    id: "2",
    title: "Global Summit 2027",
    date: "SUN 17 MAY 15:29",
    location: "LOCATION ADDRESS HERE",
  },
];

export const EventSection: React.FC<EventSectionProps> = ({
  title = "New Letter",
  events = DEFAULT_EVENTS,
  onDeleteAll,
  onRemind,
  onJoin,
  joiningEventId,
  joinedEventIds = [],
}) => {
  return (
    <div className="bg-white rounded-3xl sm:rounded-[28px] p-4 sm:p-6 md:p-7 shadow-sm border border-[#EBE1D5] relative">
      {onDeleteAll && (
        <button
          type="button"
          onClick={onDeleteAll}
          className="absolute top-5 right-5 sm:top-6 sm:right-6 font-['Inter']! text-[11px] font-medium text-[#6C5345] uppercase tracking-wider hover:text-stone-900 transition-colors duration-200 cursor-pointer"
        >
          XOÁ
        </button>
      )}

      <h2 className="text-center font-['Cormorant_Garamond']! text-[24px] sm:text-[28px] md:text-[30px] font-semibold! text-[#1B1A16] mb-4 sm:mb-5 tracking-tight">
        {title}
      </h2>

      <div className="flex flex-col border-t border-[#EAE0D6]">
        {events.map((event, index) => {
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
              <div className="flex flex-col gap-1.5 min-w-0">
                <h3 className="font-['Inter']! text-[13px] sm:text-[14px] font-medium text-[#523C37]">
                  {event.title}
                </h3>
                <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-[#B58F6F] font-['Inter']! font-medium! uppercase flex-wrap">
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
                  onClick={() => onRemind?.(event)}
                  className="bg-[#E8D9CC] text-[#6C5345] text-[10px] sm:text-[11px] font-['Inter']! font-medium px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-[12px] hover:bg-[#dfcebf] transition uppercase tracking-wider cursor-pointer active:scale-95"
                >
                  NHẮC TÔI
                </button>
                <button
                  type="button"
                  onClick={() => onJoin?.(event)}
                  disabled={isJoining || isJoined}
                  className={`text-white text-[10px] sm:text-[11px] font-['Inter']! font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-[12px] transition uppercase tracking-wider cursor-pointer active:scale-95 ${
                    isJoined
                      ? "bg-[#5C4538] cursor-default"
                      : isJoining
                        ? "bg-[#9E7C62] cursor-wait"
                        : "bg-[#B08461] hover:bg-[#9e7553]"
                  }`}
                >
                  {isJoined
                    ? "ĐÃ ĐĂNG KÝ"
                    : isJoining
                      ? "ĐANG XỬ LÝ..."
                      : "ĐĂNG KÝ NHẬN"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
