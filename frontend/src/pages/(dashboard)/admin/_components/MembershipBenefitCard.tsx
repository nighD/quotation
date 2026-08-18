import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";

interface MembershipBenefitCardProps {
  onAddCard?: () => void;
}

// Tự động định dạng chuỗi số thẻ thành các cụm 4 chữ số cách nhau bằng dấu cách
const formatCardNumber = (num?: string): string => {
  if (!num) return "0123 4567 89";
  const cleaned = num.replace(/\s+/g, "");
  return cleaned.match(/.{1,4}/g)?.join(" ") || num;
};

export const MembershipBenefitCard: React.FC<MembershipBenefitCardProps> = ({ onAddCard }) => {
  const { user } = useAuth();
  const [hasCard, setHasCard] = useState<boolean>(() => Boolean(user?.card_number));

  useEffect(() => {
    setHasCard(Boolean(user?.card_number));
  }, [user?.card_number]);

  const holderName = user?.full_name || "MEMBER NAME";
  const rawCardNumber = user?.card_number || "0123456789";
  const formattedCardNumber = formatCardNumber(rawCardNumber);

  const handleAddCard = () => {
    if (onAddCard) {
      onAddCard();
    } else {
      setHasCard(true);
    }
  };

  return (
    <div className="w-full bg-[#E8D7C9] rounded-3xl sm:rounded-[28px] p-3.5 sm:p-5 shadow-sm flex flex-col justify-between border border-[#dfd3c7]">
      <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.25 }} className="relative w-full mb-4 sm:mb-5 group select-none cursor-pointer">
        <div className="relative w-full aspect-[1.585/1] rounded-2xl overflow-hidden shadow-xl border border-[#c8b7a6]">
          <img
            src="/admin/card-vifc-pass-default.png"
            alt="IFC Pass Membership Card"
            className="w-full h-full object-cover rounded-2xl select-none pointer-events-none"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />

          {hasCard ? (
            <div className="absolute left-[5.5%] bottom-[7%] sm:bottom-[8%] flex flex-col gap-0.5 select-none z-10">
              <span className="text-white font-['Inter']! font-bold text-[11px] xs:text-[13px] sm:text-[14px] md:text-[15px] xl:text-[16px] uppercase tracking-wider leading-tight drop-shadow-md">
                {(holderName || "").toUpperCase()}
              </span>

              <div className="flex flex-col mt-0.5 sm:mt-1">
                <span className="text-[#88A6DD] text-[7px] xs:text-[8px] sm:text-[8.5px] md:text-[9.5px] font-semibold uppercase tracking-widest leading-none opacity-90">
                  CARD NO.
                </span>
                <span className="text-white font-mono font-bold text-[10px] xs:text-[12px] sm:text-[13px] md:text-[14px] xl:text-[15px] tracking-[0.14em] sm:tracking-[0.18em] leading-snug drop-shadow-md">
                  {(formattedCardNumber || "").toUpperCase()}
                </span>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-brightness-75">
              <motion.button
                type="button"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleAddCard}
                className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-linear-to-tr from-[#C5A059] via-[#E8C88A] to-[#B89047] text-[#141317] flex items-center justify-center shadow-2xl shadow-[#C5A059]/70 cursor-pointer border-2 border-white/80 transition-all duration-300 group/btn"
                title="Thêm thẻ thành viên"
              >
                <Plus className="w-5 h-5 sm:w-7 sm:h-7 text-[#141317] stroke-3 group-hover/btn:rotate-90 transition-transform duration-300" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      <div>
        <div className="flex items-center justify-between mb-2.5 sm:mb-3 select-none">
          <h3 className="text-[#1B1A16] font-['Inter'] font-semibold! text-[14px] sm:text-[16px]">Benefit Slot</h3>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-xs grid grid-cols-3 gap-2 sm:gap-3 border border-[#f0e8e0]">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-['Cormorant_Garamond'] text-[#1B1A16] text-[13px] sm:text-[15px] font-semibold truncate">Event</span>
            <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
              {hasCard ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <span key={`event-active-${i}`} className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#D16419]" />
                  ))}
                  {[...Array(4)].map((_, i) => (
                    <span key={`event-inactive-${i}`} className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#E8D7C9]" />
                  ))}
                </>
              ) : (
                [...Array(8)].map((_, i) => <span key={`event-skel-${i}`} className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#E8D7C9]" />)
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-['Cormorant_Garamond'] text-[#1B1A16] text-[13px] sm:text-[15px] font-semibold truncate">Room</span>
            <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
              {hasCard ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <span key={`room-active-${i}`} className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#D16419]" />
                  ))}
                  {[...Array(4)].map((_, i) => (
                    <span key={`room-inactive-${i}`} className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#E8D7C9]" />
                  ))}
                </>
              ) : (
                [...Array(8)].map((_, i) => <span key={`room-skel-${i}`} className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#E8D7C9]" />)
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-['Cormorant_Garamond'] text-[#1B1A16] text-[13px] sm:text-[15px] font-semibold truncate">Cowork Space</span>
            <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
              {hasCard ? (
                <>
                  {[...Array(1)].map((_, i) => (
                    <span key={`cowork-active-${i}`} className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#D16419]" />
                  ))}
                  {[...Array(7)].map((_, i) => (
                    <span key={`cowork-inactive-${i}`} className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#E8D7C9]" />
                  ))}
                </>
              ) : (
                [...Array(8)].map((_, i) => <span key={`cowork-skel-${i}`} className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#E8D7C9]" />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
