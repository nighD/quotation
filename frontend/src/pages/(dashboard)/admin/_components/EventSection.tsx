import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export interface EventItemData {
  id: string;
  title: string;
  date: string;
  location: string;
}

export interface EventSectionProps {
  events?: EventItemData[];
  onDeleteAll?: () => void;
  onRemind?: (event: EventItemData) => void;
  onJoin?: (event: EventItemData) => void;
}

const DEFAULT_EVENTS: EventItemData[] = [
  {
    id: '1',
    title: 'Global Summit 2027',
    date: 'SUN 17 MAY 15:29',
    location: 'LOCATION ADDRESS HERE',
  },
  {
    id: '2',
    title: 'Global Summit 2027',
    date: 'SUN 17 MAY 15:29',
    location: 'LOCATION ADDRESS HERE',
  },
];

export const EventSection: React.FC<EventSectionProps> = ({
  events = DEFAULT_EVENTS,
  onDeleteAll,
  onRemind,
  onJoin,
}) => {
  return (
    <div className="bg-white rounded-[28px] p-6 shadow-sm border border-[#eae0d5]">
      <div className="flex items-center justify-between mb-4 select-none">
        <h2 className="text-[28px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">
          Event
        </h2>
        <button
          type="button"
          onClick={onDeleteAll}
          className="relative group font-['Inter']! text-[10px] font-medium! text-[#664E48] uppercase tracking-wider hover:text-stone-900 transition-colors duration-200 cursor-pointer pb-0.5"
        >
          <span>XOÁ</span>
          <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#664E48] transition-all duration-300 ease-out group-hover:w-full" />
        </button>
      </div>

      <div className="flex flex-col divide-y divide-[#E5DBD2]">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            whileHover={{ x: 2 }}
            className="py-3.5 flex items-center justify-between gap-6 flex-wrap"
          >
            <div className="flex flex-col gap-2">
              <h3 className="font-['Cormorant_Garamond']! text-lg font-semibold! text-[#523C37]">
                {event.title}
              </h3>
              <div className="flex items-center gap-4 text-[10px] text-[#B58F6F] font-['Inter']! font-medium mt-1">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-[#B58F6F]" />
                  {event.date}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-[#B58F6F]" />
                  {event.location}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onRemind?.(event)}
                className="bg-[#E8D7C9] text-[#523C37] text-[8px] font-['Inter']! font-medium px-4 py-2 rounded-lg hover:bg-[#dfd3c7] transition uppercase cursor-pointer active:scale-95"
              >
                NHẮC TÔI
              </button>
              <button
                type="button"
                onClick={() => onJoin?.(event)}
                className="bg-[#B58F6F] text-white text-[8px] font-['Inter']! font-medium px-4 py-2 rounded-lg hover:bg-[#a67e63] transition uppercase cursor-pointer active:scale-95"
              >
                THAM GIA
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
