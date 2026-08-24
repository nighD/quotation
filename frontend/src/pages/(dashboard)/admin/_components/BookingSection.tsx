import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CourseRegistrationModal, type CourseDetailInfo, type CourseRegistrationFormData } from "../../../../components/CourseRegistrationModal";

export interface BookingCardRequest {
  bookingType: string;
  bookingTitle: string;
  note?: string;
}

interface CourseCardItem {
  bookingType: string;
  bookingTitle: string;
  title: string;
  description: string;
  image: string;
  fallbackImage: string;
  instructor?: string;
  duration?: string;
  schedule?: string;
}

const COURSES: CourseCardItem[] = [
  {
    bookingType: "meeting-room",
    bookingTitle: "Khóa học chuyên sâu — Ngành hàng hóa",
    title: "KHÓA HỌC CHUYÊN SÂU — NGÀNH HÀNG HÓA",
    description:
      "Dành cho doanh nghiệp xuất khẩu, nhà sản xuất và nhà giao dịch hàng hóa đang muốn thoát khỏi thế bị động — khi tài sản nằm trong kho nhưng dòng vốn vẫn phụ thuộc vào sàn nước ngoài và ngân hàng truyền thống. Hạ tầng on-chain đang mở ra cơ chế mới: lô hàng cà phê, gạo, hồ tiêu có thể được số hóa thành chứng từ có giá trị tài chính — xác thực độc lập, giao dịch được, và tiếp cận thẳng dòng vốn quốc tế mà không qua trung gian bảo lãnh.",
    image: "/admin/booking-01.png",
    fallbackImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=90",
    instructor: "Chuyên Gia On-Chainpass",
    duration: "4 tuần (8 buổi)",
    schedule: "Tối Thứ 3 & Thứ 5",
  },
  {
    bookingType: "lounge",
    bookingTitle: "Khóa học chuyên sâu — Ngành du lịch",
    title: "KHÓA HỌC CHUYÊN SÂU — NGÀNH DU LỊCH",
    description:
      "Dành cho doanh nghiệp phát triển bất động sản du lịch, chủ tài sản và nhà đầu tư đang bị kẹt giữa tài sản lớn và thanh khoản thấp — khi muốn huy động vốn quốc tế nhưng không có cấu trúc tài chính phù hợp. Hạ tầng on-chain cho phép phân nhỏ quyền sở hữu tài sản nghỉ dưỡng thành các đơn vị đầu tư có thể giao dịch — mở ra nhóm nhà đầu tư tổ chức quốc tế mà trước đây không thể tiếp cận do rào cản ticket size và pháp lý.",
    image: "/admin/booking-02.png",
    fallbackImage: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1000&q=90",
    instructor: "Chuyên Gia Tài Chính & RWA",
    duration: "4 tuần (8 buổi)",
    schedule: "Tối Thứ 2 & Thứ 4",
  },
];

interface BookingSectionProps {
  onSubmitRequest: (request: BookingCardRequest) => void | Promise<void>;
  submittingBookingType: string | null;
  requestedBookingTypes: string[];
}

export const BookingSection: React.FC<BookingSectionProps> = ({ onSubmitRequest, submittingBookingType, requestedBookingTypes }) => {
  const navigate = useNavigate();

  const [selectedCourse, setSelectedCourse] = useState<CourseDetailInfo | null>(null);
  const [activeBookingType, setActiveBookingType] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isSubmitting = (bookingType: string) => submittingBookingType === bookingType;
  const hasRequested = (bookingType: string) => requestedBookingTypes.includes(bookingType);

  const handleOpenCourseModal = (course: CourseCardItem) => {
    setActiveBookingType(course.bookingType);
    setSelectedCourse({
      id: course.bookingType,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      duration: course.duration,
      schedule: course.schedule,
      thumbnail: course.image,
      badge: "Khóa Học Chuyên Sâu",
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData: CourseRegistrationFormData) => {
    if (!activeBookingType) return;
    await onSubmitRequest({
      bookingType: activeBookingType,
      bookingTitle: formData.courseTitle || selectedCourse?.title || "Khóa Học Chuyên Sâu",
      note: formData.note,
    });
  };

  return (
    <div className="w-full min-h-[498.78px] bg-[#B58F6F] rounded-[28px] p-5 shadow-sm flex flex-col justify-between border border-[#a67e63]">
      <h2 className="text-[28px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16] mb-4 select-none">Khóa học</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-stretch min-w-0">
        {COURSES.map((course) => {
          const registered = hasRequested(course.bookingType);
          const loading = isSubmitting(course.bookingType);

          return (
            <motion.div
              key={course.bookingType}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="w-full min-w-0 min-h-[394.78px] bg-[#E8D7C9] rounded-[20px] p-5 flex flex-col justify-between shadow-xs border border-[#dfd3c7]"
            >
              <div>
                <div onClick={() => handleOpenCourseModal(course)} className="w-full h-[209.41px] rounded-2xl overflow-hidden mb-3 group cursor-pointer">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = course.fallbackImage;
                    }}
                  />
                </div>
                <h3
                  onClick={() => handleOpenCourseModal(course)}
                  className="text-[22px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16] mb-1.5 cursor-pointer hover:text-[#3C2A25] transition-colors"
                >
                  {course.title}
                </h3>
                <p className="text-[#523C37] font-['Inter']! font-normal! text-[12px] leading-relaxed line-clamp-3">{course.description}</p>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {registered && (
                    <button
                      type="button"
                      onClick={() => navigate("/admin/booking")}
                      className="bg-[#48372D] hover:bg-[#382b24] text-white font-medium text-[11px] tracking-wider uppercase px-3 py-2.5 rounded-sm shadow-xs transition-all cursor-pointer inline-flex items-center gap-1 active:scale-[0.98]"
                    >
                      ĐÃ ĐĂNG KÝ <span className="text-sm">→</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenCourseModal(course)}
                    disabled={loading}
                    className="bg-[#48372D] hover:bg-[#382b24] text-white font-medium text-[11px] tracking-wider uppercase px-4 py-2.5 rounded-sm shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-[0.98]"
                  >
                    {loading ? "ĐANG GỬI..." : registered ? "GỬI THÊM YÊU CẦU" : "ĐĂNG KÝ"} <span className="text-sm">→</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <CourseRegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} course={selectedCourse} onSubmit={handleModalSubmit} />
    </div>
  );
};
