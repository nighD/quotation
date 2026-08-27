import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../../../api/client";
import { CourseRegistrationModal, type CourseDetailInfo, type CourseRegistrationFormData } from "../../../../../components/CourseRegistrationModal";
import type { CourseCardItem, CourseSectionProps } from "./type";

export const CourseSection: React.FC<CourseSectionProps> = ({ onSubmitRequest, submittingBookingType, requestedBookingTypes, initialCourses }) => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<CourseCardItem[]>(initialCourses || []);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(!initialCourses || initialCourses.length === 0);
  const [selectedCourse, setSelectedCourse] = useState<CourseDetailInfo | null>(null);
  const [activeBookingType, setActiveBookingType] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDraggingCards, setIsDraggingCards] = useState(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const { data } = await apiClient.get("/cms/courses");
        if (data.success && Array.isArray(data.data)) {
          const mappedCourses: CourseCardItem[] = data.data.map((item: any) => ({
            id: item.id,
            bookingType: item.booking_type || item.bookingType || item.id,
            bookingTitle: item.booking_title || item.bookingTitle || item.title,
            title: item.title,
            description: item.description || "",
            image: item.image || "/admin/booking-01.png",
            fallbackImage:
              item.fallback_image || item.fallbackImage || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=90",
            instructor: item.instructor || "Chuyên Gia On-Chainpass",
            duration: item.duration || "4 tuần (8 buổi)",
            schedule: item.schedule || "Linh hoạt",
            tuitionFee: item.tuition_fee ?? item.tuitionFee ?? 0,
            status: item.status || "active",
            orderIndex: item.order_index ?? item.orderIndex ?? 0,
          }));
          setCourses(mappedCourses);
        }
      } catch (err) {
        console.error("Failed to fetch courses from /cms/courses:", err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [courses]);

  const handleCardsMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDraggingCards(true);
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingCards && scrollRef.current) {
        const dx = e.clientX - startXRef.current;
        if (Math.abs(dx) > 5) {
          hasDraggedRef.current = true;
        }
        scrollRef.current.scrollLeft = startScrollLeftRef.current - dx;
        checkScroll();
      }
    };

    const handleMouseUp = () => {
      setIsDraggingCards(false);
    };

    if (isDraggingCards) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingCards]);

  const scrollByAmount = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.clientWidth / 2;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 300);
  };

  const isSubmitting = (bookingType: string) => submittingBookingType === bookingType;
  const hasRequested = (bookingType: string) => requestedBookingTypes.includes(bookingType);

  const handleOpenCourseModal = (course: CourseCardItem) => {
    if (hasDraggedRef.current) return;
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
    <div className="w-full min-h-[498.78px] bg-[#B58F6F] rounded-[28px] p-4 sm:p-5 shadow-sm flex flex-col justify-between border border-[#a67e63] overflow-hidden min-w-0">
      <div className="flex items-center justify-between mb-4 select-none">
        <h2 className="text-[24px] sm:text-[28px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">Khóa học</h2>

        {courses.length > 2 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollByAmount("left")}
              disabled={!canScrollLeft}
              className={`w-7 h-7 rounded-full flex items-center justify-center border border-[#3C2A25]/30 text-[#1B1A16] transition-all ${
                canScrollLeft ? "hover:bg-[#3C2A25] hover:text-white cursor-pointer active:scale-95" : "opacity-30 cursor-not-allowed"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount("right")}
              disabled={!canScrollRight}
              className={`w-7 h-7 rounded-full flex items-center justify-center border border-[#3C2A25]/30 text-[#1B1A16] transition-all ${
                canScrollRight ? "hover:bg-[#3C2A25] hover:text-white cursor-pointer active:scale-95" : "opacity-30 cursor-not-allowed"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {loadingCourses ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-stretch min-w-0 w-full">
          {[1, 2].map((i) => (
            <div key={i} className="w-full min-h-[394.78px] bg-[#E8D7C9]/60 rounded-[20px] p-5 flex flex-col justify-between animate-pulse">
              <div>
                <div className="w-full h-[209.41px] bg-[#d9c4b3] rounded-2xl mb-3" />
                <div className="h-6 bg-[#d9c4b3] rounded-md w-3/4 mb-2" />
                <div className="h-4 bg-[#d9c4b3] rounded-md w-full mb-1" />
                <div className="h-4 bg-[#d9c4b3] rounded-md w-5/6" />
              </div>
              <div className="h-9 bg-[#d9c4b3] rounded-sm w-1/3 mt-4" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-12 text-[#48372D] text-sm font-['Inter']">Hiện chưa có khóa học nào được mở.</div>
      ) : courses.length > 2 ? (
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          onMouseDown={handleCardsMouseDown}
          className={`flex gap-4 overflow-x-auto scrollbar-none flex-1 items-stretch min-w-0 select-none pb-1 touch-pan-x ${
            isDraggingCards ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {courses.map((course) => {
            const registered = hasRequested(course.bookingType);
            const loading = isSubmitting(course.bookingType);

            return (
              <motion.div
                key={course.id || course.bookingType}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="w-full sm:w-[calc(50%-8px)] min-w-[280px] sm:min-w-[300px] shrink-0 min-h-[394.78px] bg-[#E8D7C9] rounded-[20px] p-4 sm:p-5 flex flex-col justify-between shadow-xs border border-[#dfd3c7]"
              >
                <div>
                  <div
                    onClick={() => handleOpenCourseModal(course)}
                    className="w-full h-[200px] sm:h-[209.41px] rounded-2xl overflow-hidden mb-3 group cursor-pointer"
                  >
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          course.fallbackImage || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=90";
                      }}
                    />
                  </div>
                  <h3
                    onClick={() => handleOpenCourseModal(course)}
                    className="text-[20px] sm:text-[22px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16] mb-1.5 cursor-pointer hover:text-[#3C2A25] transition-colors line-clamp-2"
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-stretch min-w-0 w-full">
          {courses.map((course) => {
            const registered = hasRequested(course.bookingType);
            const loading = isSubmitting(course.bookingType);

            return (
              <motion.div
                key={course.id || course.bookingType}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="w-full min-w-0 min-h-[394.78px] bg-[#E8D7C9] rounded-[20px] p-4 sm:p-5 flex flex-col justify-between shadow-xs border border-[#dfd3c7]"
              >
                <div>
                  <div
                    onClick={() => handleOpenCourseModal(course)}
                    className="w-full h-[200px] sm:h-[209.41px] rounded-2xl overflow-hidden mb-3 group cursor-pointer"
                  >
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          course.fallbackImage || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=90";
                      }}
                    />
                  </div>
                  <h3
                    onClick={() => handleOpenCourseModal(course)}
                    className="text-[20px] sm:text-[22px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16] mb-1.5 cursor-pointer hover:text-[#3C2A25] transition-colors line-clamp-2"
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
      )}

      <CourseRegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} course={selectedCourse} onSubmit={handleModalSubmit} />
    </div>
  );
};

export const BookingSection = CourseSection;
export type { CourseSectionProps as BookingSectionProps };
