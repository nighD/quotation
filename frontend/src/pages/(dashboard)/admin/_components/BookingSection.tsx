import React from 'react';
import { motion } from 'framer-motion';

export const BookingSection: React.FC = () => {
  return (
    <div className="w-full min-h-[498.78px] bg-[#B58F6F] rounded-[28px] p-5 shadow-sm flex flex-col justify-between border border-[#a67e63]">
      <h2 className="text-[28px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16] mb-4 select-none">
        Booking Title here
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-stretch min-w-0">
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="w-full min-w-0 min-h-[394.78px] bg-[#E8D7C9] rounded-[20px] p-5 flex flex-col justify-between shadow-xs border border-[#dfd3c7]"
        >
          <div>
            <div className="w-full h-[209.41px] rounded-2xl overflow-hidden mb-3 group">
              <img
                src="/admin/booking-01.png"
                alt="Meeting Room"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=90";
                }}
              />
            </div>
            <h3 className="text-[24px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16] mb-1.5">
              Meeting Room
            </h3>
            <p className="text-[#523C37] font-['Inter']! font-normal! text-[12px] leading-relaxed line-clamp-3">
              Phòng Grand Ballroom là trung tâm hội nghị quốc tế lớn và hiện đại bậc nhất miền Trung. Với sức chứa tối đa 750 khách hội nghị và 500 khách tiệc ngồi, đây là không gia...
            </p>
          </div>

          <div className="mt-4">
            <button
              type="button"
              className="bg-[#48372D] hover:bg-[#382b24] text-white font-medium text-[11px] tracking-wider uppercase px-4 py-2.5 rounded-sm shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-[0.98]"
            >
              GỬI YÊU CẦU <span className="text-sm">→</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="w-full min-w-0 min-h-[394.78px] bg-[#E8D7C9] rounded-[20px] p-5 flex flex-col justify-between shadow-xs border border-[#dfd3c7]"
        >
          <div>
            <div className="w-full h-[209.41px] rounded-2xl overflow-hidden mb-3 group">
              <img
                src="/admin/booking-02.png"
                alt="Lounge"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1000&q=90";
                }}
              />
            </div>
            <h3 className="text-[24px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16] mb-1.5">
              Lounge
            </h3>
            <p className="text-[#523C37] font-['Inter']! font-normal! text-[12px] leading-relaxed line-clamp-3">
              Phòng Grand Ballroom là trung tâm hội nghị quốc tế lớn và hiện đại bậc nhất miền Trung. Với sức chứa tối đa 750 khách hội nghị và 500 khách tiệc ngồi, đây là không gia...
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              className="bg-[#48372D] hover:bg-[#382b24] text-white font-medium text-[11px] tracking-wider uppercase px-3 py-2.5 rounded-sm shadow-xs transition-all cursor-pointer inline-flex items-center gap-1 active:scale-[0.98]"
            >
              XEM LOUNGE ĐÃ ĐẶT <span className="text-sm">→</span>
            </button>
            <button
              type="button"
              className="bg-[#B58F6F] hover:bg-[#94715b] text-white font-medium text-[11px] tracking-wider uppercase px-3 py-2.5 rounded-sm shadow-xs transition-all cursor-pointer inline-flex items-center gap-1 active:scale-[0.98]"
            >
              GỬI THÊM YÊU CẦU <span className="text-sm">→</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
