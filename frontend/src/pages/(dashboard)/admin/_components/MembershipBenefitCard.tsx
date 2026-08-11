import React from 'react';
import { motion } from 'framer-motion';

export const MembershipBenefitCard: React.FC = () => {
  return (
    <div className="w-full bg-[#E8D7C9] rounded-[20px] p-3 shadow-sm flex flex-col justify-between border border-[#e2d5c7]">
      <motion.div
        whileHover={{ scale: 1.015 }}
        transition={{ duration: 0.25 }}
        className="relative w-full flex justify-center mb-5 group cursor-pointer"
      >
        <div className="relative w-full shadow-xl transition-transform duration-300 group-hover:scale-[1.01]">
          <img
            src="/admin/card-vifc-pass.png"
            alt="IFC Pass Membership Card"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      </motion.div>

      <div>
        <h3 className="text-[#1B1A16] font-['Inter'] font-semibold! text-[16px] mb-3 select-none">Benefit Slot</h3>
        <div className="bg-white rounded-2xl p-4 shadow-xs flex items-center justify-between gap-2 border border-[#f0e8e0]">
          <div className="flex flex-col gap-1 flex-1">
            <span className="font-['Cormorant_Garamond'] text-[#1B1A16] text-[16px] font-semibold">Event</span>
            <div className="flex items-center gap-1">
              {[...Array(4)].map((_, i) => (
                <span key={`event-active-${i}`} className="w-2.5 h-2.5 rounded-full bg-[#D16419]" />
              ))}
              {[...Array(4)].map((_, i) => (
                <span key={`event-inactive-${i}`} className="w-2.5 h-2.5 rounded-full bg-[#E8D7C9]" />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <span className="font-['Cormorant_Garamond'] text-[#1B1A16] text-[16px] font-semibold">Room</span>
            <div className="flex items-center gap-1">
              {[...Array(4)].map((_, i) => (
                <span key={`room-active-${i}`} className="w-2.5 h-2.5 rounded-full bg-[#D16419]" />
              ))}
              {[...Array(4)].map((_, i) => (
                <span key={`room-inactive-${i}`} className="w-2.5 h-2.5 rounded-full bg-[#E8D7C9]" />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <span className="font-['Cormorant_Garamond'] text-[#1B1A16] text-[16px] font-semibold">Cowork Space</span>
            <div className="flex items-center gap-1">
              {[...Array(1)].map((_, i) => (
                <span key={`cowork-active-${i}`} className="w-2.5 h-2.5 rounded-full bg-[#D16419]" />
              ))}
              {[...Array(7)].map((_, i) => (
                <span key={`cowork-inactive-${i}`} className="w-2.5 h-2.5 rounded-full bg-[#E8D7C9]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
