import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

interface MembershipBenefitCardProps {
  onAddCard?: () => void;
}

export const MembershipBenefitCard: React.FC<MembershipBenefitCardProps> = ({ onAddCard }) => {
  const { user } = useAuth();
  const realHasCard = Boolean(user?.card_number);
  const [hasCard, setHasCard] = useState(realHasCard);

  const cardNumber = user?.card_number || '';

  const handleAddCard = () => {
    if (onAddCard) {
      onAddCard();
    } else {
      setHasCard(true);
    }
  };

  return (
    <div className="w-full bg-[#E8D7C9] rounded-[20px] p-3 shadow-sm flex flex-col justify-between border border-[#e2d5c7]">
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.25 }}
        className="relative w-full mb-5 group select-none cursor-pointer"
      >
        <div className="relative w-full aspect-[1.585/1] rounded-2xl overflow-hidden shadow-xl border border-[#c8b7a6]">
          <img
            src="/admin/card-vifc-pass.png"
            alt="IFC Pass Membership Card"
            className="w-full h-full object-cover rounded-2xl"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          {hasCard ? (
            /* REAL CARD WITH USER DATA OVERLAY */
            <>
              <div
                className="absolute left-[8%] top-[57%] text-white font-mono tracking-[0.18em] select-none text-[12px] xs:text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] font-semibold"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                {cardNumber.toUpperCase()}
              </div>
            </>
          ) : (
            /* EMPTY CARD STATE WITH CENTERED GOLD PLUS (+) BUTTON AND DARK OVERLAY */
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-brightness-75">
              <motion.button
                type="button"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleAddCard}
                className="w-12 h-12 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-[#C5A059] via-[#E8C88A] to-[#B89047] text-[#141317] flex items-center justify-center shadow-2xl shadow-[#C5A059]/70 cursor-pointer border-2 border-white/80 transition-all duration-300 group/btn"
                title="Thêm thẻ thành viên"
              >
                <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-[#141317] stroke-[3] group-hover/btn:rotate-90 transition-transform duration-300" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      <div>
        <div className="flex items-center justify-between mb-3 select-none">
          <h3 className="text-[#1B1A16] font-['Inter'] font-semibold! text-[16px]">Benefit Slot</h3>
          <button
            type="button"
            onClick={() => setHasCard(!hasCard)}
            className="text-[11px] font-medium text-[#7C6354] hover:text-[#3C2A25] underline cursor-pointer transition-colors"
          >
            {hasCard ? 'Xem Thẻ Trống' : 'Xem Thẻ Đã Có'}
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs flex items-center justify-between gap-2 border border-[#f0e8e0]">
          <div className="flex flex-col gap-1 flex-1">
            <span className="font-['Cormorant_Garamond'] text-[#1B1A16] text-[16px] font-semibold">Event</span>
            <div className="flex items-center gap-1">
              {hasCard ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <span key={`event-active-${i}`} className="w-2.5 h-2.5 rounded-full bg-[#D16419]" />
                  ))}
                  {[...Array(4)].map((_, i) => (
                    <span key={`event-inactive-${i}`} className="w-2.5 h-2.5 rounded-full bg-[#E8D7C9]" />
                  ))}
                </>
              ) : (
                [...Array(8)].map((_, i) => (
                  <span key={`event-skel-${i}`} className="w-2.5 h-2.5 rounded-full bg-[#E8D7C9]" />
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <span className="font-['Cormorant_Garamond'] text-[#1B1A16] text-[16px] font-semibold">Room</span>
            <div className="flex items-center gap-1">
              {hasCard ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <span key={`room-active-${i}`} className="w-2.5 h-2.5 rounded-full bg-[#D16419]" />
                  ))}
                  {[...Array(4)].map((_, i) => (
                    <span key={`room-inactive-${i}`} className="w-2.5 h-2.5 rounded-full bg-[#E8D7C9]" />
                  ))}
                </>
              ) : (
                [...Array(8)].map((_, i) => (
                  <span key={`room-skel-${i}`} className="w-2.5 h-2.5 rounded-full bg-[#E8D7C9]" />
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <span className="font-['Cormorant_Garamond'] text-[#1B1A16] text-[16px] font-semibold">Cowork Space</span>
            <div className="flex items-center gap-1">
              {hasCard ? (
                <>
                  {[...Array(1)].map((_, i) => (
                    <span key={`cowork-active-${i}`} className="w-2.5 h-2.5 rounded-full bg-[#D16419]" />
                  ))}
                  {[...Array(7)].map((_, i) => (
                    <span key={`cowork-inactive-${i}`} className="w-2.5 h-2.5 rounded-full bg-[#E8D7C9]" />
                  ))}
                </>
              ) : (
                [...Array(8)].map((_, i) => (
                  <span key={`cowork-skel-${i}`} className="w-2.5 h-2.5 rounded-full bg-[#E8D7C9]" />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



