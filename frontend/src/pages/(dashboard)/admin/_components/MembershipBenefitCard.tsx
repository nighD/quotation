import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../../context/AuthContext';

export const MembershipBenefitCard: React.FC = () => {
  const { user } = useAuth();
  const hasCard = Boolean(user?.card_number);
  const cardNumber = user?.card_number || '';
  const userName = user?.full_name || '';
  const rawRole = user?.card_type || (user?.roles && user.roles.length > 0 ? user.roles[0] : 'user');

  const getDisplayRole = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'ADMINISTRATOR';
      case 'premium':
        return 'FOUNDING PIONEER';
      case 'standard':
        return 'STANDARD MEMBER';
      case 'base':
        return 'BASIC MEMBER';
      default:
        return 'MEMBER';
    }
  };
  const cardRole = getDisplayRole(rawRole);

  return (
    <div className="w-full bg-[#E8D7C9] rounded-[20px] p-3 shadow-sm flex flex-col justify-between border border-[#e2d5c7]">
      <motion.div
        whileHover={{ scale: 1.015 }}
        transition={{ duration: 0.25 }}
        className="relative w-full flex justify-center mb-5 group cursor-pointer"
      >
        <div className="relative w-full shadow-xl transition-transform duration-300 group-hover:scale-[1.01] rounded-[15px] overflow-hidden">
          <img
            src="/admin/card-vifc-pass.png"
            alt="IFC Pass Membership Card"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          {hasCard && (
            <>
              {/* Card Number */}
              <div 
                className="absolute left-[8%] top-[57%] text-white font-mono tracking-[0.18em] select-none text-[12px] xs:text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] font-semibold"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                {cardNumber.toUpperCase()}
              </div>
              
              {/* User Name */}
              <div 
                className="absolute left-[8%] bottom-[10%] text-stone-200 font-sans tracking-[0.1em] select-none text-[9px] xs:text-[10px] sm:text-[11px] md:text-[12px] font-semibold uppercase"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                {userName}
              </div>
              
              {/* Role */}
              <div 
                className="absolute right-[8%] bottom-[10%] text-[#B58F6F] font-sans tracking-[0.1em] select-none text-[9px] xs:text-[10px] sm:text-[11px] md:text-[12px] font-bold uppercase"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                {cardRole}
              </div>
            </>
          )}
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
