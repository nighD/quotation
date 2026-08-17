import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export interface BookingCardRequest {
  bookingType: string;
  bookingTitle: string;
}

interface BookingSectionProps {
  onSubmitRequest: (request: BookingCardRequest) => void | Promise<void>;
  submittingBookingType: string | null;
  requestedBookingTypes: string[];
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  onSubmitRequest,
  submittingBookingType,
  requestedBookingTypes,
}) => {
  const navigate = useNavigate();

  const isSubmitting = (bookingType: string) => submittingBookingType === bookingType;
  const hasRequested = (bookingType: string) => requestedBookingTypes.includes(bookingType);

  return (
    <div className="w-full min-h-[498.78px] bg-[#B58F6F] rounded-[28px] p-5 shadow-sm flex flex-col justify-between border border-[#a67e63]">
      <h2 className="text-[28px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16] mb-4 select-none">
        Khóa học
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
            <h3 className="text-[22px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16] mb-1.5">
              KHÓA HỌC CHUYÊN SÂU — NGÀNH HÀNG HÓA
            </h3>
            <p className="text-[#523C37] font-['Inter']! font-normal! text-[12px] leading-relaxed line-clamp-3">
              Dành cho doanh nghiệp xuất khẩu, nhà sản xuất và nhà giao dịch hàng hóa đang muốn thoát khỏi thế bị động — khi tài sản nằm trong kho nhưng dòng vốn vẫn phụ thuộc vào sàn nước ngoài và ngân hàng truyền thống.
              Hạ tầng on-chain đang mở ra cơ chế mới: lô hàng cà phê, gạo, hồ tiêu có thể được số hóa thành chứng từ có giá trị tài chính — xác thực độc lập, giao dịch được, và tiếp cận thẳng dòng vốn quốc tế mà không qua trung gian bảo lãnh.            </p>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 flex-wrap">
              {hasRequested('meeting-room') && (
                <button
                  type="button"
                  onClick={() => navigate('/admin/booking')}
                  className="bg-[#48372D] hover:bg-[#382b24] text-white font-medium text-[11px] tracking-wider uppercase px-3 py-2.5 rounded-sm shadow-xs transition-all cursor-pointer inline-flex items-center gap-1 active:scale-[0.98]"
                >
                  ĐÃ ĐĂNG KÝ <span className="text-sm">→</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onSubmitRequest({ bookingType: 'meeting-room', bookingTitle: 'Meeting Room' })}
                disabled={isSubmitting('meeting-room')}
                className="bg-[#48372D] hover:bg-[#382b24] text-white font-medium text-[11px] tracking-wider uppercase px-4 py-2.5 rounded-sm shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-[0.98]"
              >
                {isSubmitting('meeting-room') ? 'ĐANG GỬI...' : hasRequested('meeting-room') ? 'GỬI THÊM YÊU CẦU' : 'ĐĂNG KÝ'} <span className="text-sm">→</span>
              </button>
            </div>
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
            <h3 className="text-[22px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16] mb-1.5">
              KHÓA HỌC CHUYÊN SÂU — NGÀNH DU LỊCH

            </h3>
            <p className="text-[#523C37] font-['Inter']! font-normal! text-[12px] leading-relaxed line-clamp-3">
              Dành cho doanh nghiệp phát triển bất động sản du lịch, chủ tài sản và nhà đầu tư đang bị kẹt giữa tài sản lớn và thanh khoản thấp — khi muốn huy động vốn quốc tế nhưng không có cấu trúc tài chính phù hợp.
              Hạ tầng on-chain cho phép phân nhỏ quyền sở hữu tài sản nghỉ dưỡng thành các đơn vị đầu tư có thể giao dịch — mở ra nhóm nhà đầu tư tổ chức quốc tế mà trước đây không thể tiếp cận do rào cản ticket size và pháp lý.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {hasRequested('lounge') && (
              <button
                type="button"
                onClick={() => navigate('/admin/booking')}
                className="bg-[#48372D] hover:bg-[#382b24] text-white font-medium text-[11px] tracking-wider uppercase px-3 py-2.5 rounded-sm shadow-xs transition-all cursor-pointer inline-flex items-center gap-1 active:scale-[0.98]"
              >
                ĐÃ ĐĂNG KÝ <span className="text-sm">→</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onSubmitRequest({ bookingType: 'meeting-room', bookingTitle: 'Meeting Room' })}
              disabled={isSubmitting('meeting-room')}
              className="bg-[#48372D] hover:bg-[#382b24] text-white font-medium text-[11px] tracking-wider uppercase px-4 py-2.5 rounded-sm shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-[0.98]"
            >
              {isSubmitting('meeting-room') ? 'ĐANG GỬI...' : hasRequested('meeting-room') ? 'GỬI THÊM YÊU CẦU' : 'ĐĂNG KÝ'} <span className="text-sm">→</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
