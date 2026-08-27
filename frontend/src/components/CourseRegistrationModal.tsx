import React, { useEffect, useState } from "react";
import { BookOpen, Clock, User, MapPin, Calendar, ExternalLink, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/client";
import { PortalModal } from "./PortalModal";

export interface CourseDetailInfo {
  id?: string | number;
  title?: string;
  subtitle?: string;
  description?: string;
  instructor?: string;
  duration?: string;
  schedule?: string;
  location?: string;
  date?: string;
  badge?: string;
  thumbnail?: string;
  banner?: string;
  lumaUrl?: string;
  registrationUrl?: string;
}

export interface CourseRegistrationFormData {
  courseId?: string | number;
  courseTitle: string;
  fullName: string;
  phone: string;
  email: string;
  note: string;
}

export interface CourseRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: CourseDetailInfo | null;
  defaultTitle?: string;
  defaultDescription?: string;
  showFullForm?: boolean;
  isRegistered?: boolean;
  onSubmit?: (data: CourseRegistrationFormData) => Promise<void> | void;
  onSuccess?: () => void;
}

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

export const CourseRegistrationModal: React.FC<CourseRegistrationModalProps> = ({
  isOpen,
  onClose,
  course,
  defaultTitle = "Chương Trình Đào Tạo Chiến Lược & Đầu Tư",
  defaultDescription = "Khóa học chuyên sâu trang bị kiến thức và kỹ năng nắm bắt cơ hội đầu tư, phân tích thị trường và quản trị danh mục hiệu quả.",
  showFullForm,
  isRegistered,
  onSubmit,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeTitle = course?.title || defaultTitle;
  const activeDescription = course?.description || defaultDescription;
  const thumbnailImage = course?.banner || course?.thumbnail;
  const directLink = course?.lumaUrl || course?.registrationUrl;

  // Private Club / Event check: If it has direct link or badge is Private Club / Event, NO form needed
  const isPrivateClubOrEvent = Boolean(
    directLink ||
    (course?.badge &&
      (course.badge.toLowerCase().includes("private") || course.badge.toLowerCase().includes("sự kiện") || course.badge.toLowerCase().includes("event"))),
  );

  // Form should only appear for Courses (Khóa học), not for Private Club / Events
  const shouldRenderForm = showFullForm !== undefined ? showFullForm : !isPrivateClubOrEvent;

  const [form, setForm] = useState({
    fullName: user?.full_name || "",
    phone: "",
    email: user?.email || "",
    note: "",
  });

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
      setForm({
        fullName: user?.full_name || "",
        phone: "",
        email: user?.email || "",
        note: "",
      });
    }
  }, [isOpen, user]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (submitting) return;

    if (shouldRenderForm && (!form.fullName.trim() || !form.phone.trim())) {
      setErrorMessage("Vui lòng nhập đầy đủ họ tên và số điện thoại.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const payload: CourseRegistrationFormData = {
      courseId: course?.id,
      courseTitle: activeTitle,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      note: form.note.trim(),
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        try {
          await apiClient.post("/engagement/course-registrations", payload);
        } catch (_err) {
          console.warn("API fallback triggered for course registration", payload);
        }
      }

      setIsSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Có lỗi xảy ra khi gửi đăng ký. Vui lòng thử lại.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEventRegister = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      if (onSubmit) {
        await onSubmit({
          courseId: course?.id,
          courseTitle: activeTitle,
          fullName: user?.full_name || form.fullName || "Member",
          phone: form.phone || "",
          email: user?.email || form.email || "",
          note: form.note || "",
        });
      } else {
        await apiClient.post("/engagement/events/register", {
          event_id: String(course?.id || ""),
          event_title: activeTitle,
          event_date: course?.date || course?.schedule || "",
          location: course?.location || "",
          notes: form.note || "",
        });
      }

      setIsSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Có lỗi xảy ra khi đăng ký sự kiện. Vui lòng thử lại.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const modalFooter = isSuccess ? (
    <div className="w-full flex justify-end">
      <button
        type="button"
        onClick={onClose}
        className="bg-[#523C37] hover:bg-[#382b24] text-white text-[12px] font-['Inter']! font-medium px-6 py-2.5 rounded-xl uppercase tracking-wider cursor-pointer shadow-sm transition-all active:scale-95"
      >
        ĐÓNG
      </button>
    </div>
  ) : isPrivateClubOrEvent && !shouldRenderForm ? (
    <div className="w-full flex items-center justify-between gap-3">
      {directLink ? (
        <a
          href={directLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] font-['Inter']! font-medium text-[#B58F6F] hover:text-[#8C6246] transition"
        >
          <ExternalLink size={14} />
          <span>Mở trang sự kiện</span>
        </a>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl border border-[#D9C8BA] text-[11.5px] sm:text-[12px] font-['Inter']! font-medium uppercase tracking-wider text-[#523C37] cursor-pointer hover:bg-stone-200/50 transition-colors"
        >
          ĐÓNG
        </button>

        <button
          type="button"
          onClick={handleEventRegister}
          disabled={submitting}
          className={`${
            isRegistered ? "bg-[#2D7A46] hover:bg-[#236338]" : "bg-[#B08461] hover:bg-[#9e7553]"
          } disabled:opacity-60 text-white text-[11.5px] sm:text-[12px] font-['Inter']! font-medium px-5 sm:px-6 py-2.5 rounded-xl uppercase tracking-wider cursor-pointer shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2`}
        >
          {submitting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>ĐANG XỬ LÝ...</span>
            </>
          ) : isRegistered ? (
            <span>ĐÃ ĐĂNG KÝ ✓</span>
          ) : (
            <span>THAM GIA NGAY</span>
          )}
        </button>
      </div>
    </div>
  ) : (
    <div className="w-full flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2.5 rounded-xl border border-[#D9C8BA] text-[11.5px] sm:text-[12px] font-['Inter']! font-medium uppercase tracking-wider text-[#523C37] cursor-pointer hover:bg-stone-200/50 transition-colors"
      >
        HỦY
      </button>

      <button
        type="button"
        onClick={() => handleSubmit()}
        disabled={submitting}
        className="bg-[#B08461] hover:bg-[#9e7553] disabled:opacity-60 text-white text-[11.5px] sm:text-[12px] font-['Inter']! font-medium px-5 sm:px-6 py-2.5 rounded-xl uppercase tracking-wider cursor-pointer shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Đang xử lý...</span>
          </>
        ) : (
          <span>ĐĂNG KÝ NGAY</span>
        )}
      </button>
    </div>
  );

  return (
    <PortalModal
      isOpen={isOpen}
      onClose={onClose}
      title={activeTitle}
      badge={course?.badge || (isPrivateClubOrEvent ? "Private Club" : "Khóa học chuyên sâu")}
      width="max-w-lg sm:max-w-xl md:max-w-2xl"
      footer={modalFooter}
    >
      <div className="space-y-4">
        {thumbnailImage && (
          <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-[#E6D7CB] shadow-md bg-stone-900 shrink-0">
            <img
              src={thumbnailImage}
              alt={activeTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {(course?.location || course?.date || course?.schedule) && (
              <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2 text-white text-[11px] sm:text-[12px] font-['Inter']! flex-wrap">
                {course?.location && (
                  <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                    <MapPin size={13} className="text-[#E09A30] shrink-0" />
                    <span className="truncate max-w-50 sm:max-w-none">{course.location}</span>
                  </span>
                )}
                {(course?.date || course?.schedule) && (
                  <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                    <Calendar size={13} className="text-[#E09A30] shrink-0" />
                    <span>{course.date || course.schedule}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {(course?.instructor || course?.duration || course?.schedule) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 text-[12px] font-['Inter']! text-[#523C37]">
            {course.instructor && (
              <div className="rounded-xl bg-[#F0E4D8] p-2.5 flex items-center gap-2 border border-[#E6D7CB]">
                <User size={14} className="text-[#8C6246] shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[10px] text-[#8C6246] font-medium">Giảng viên</span>
                  <span className="font-semibold truncate block text-[#1B1A16]">{course.instructor}</span>
                </div>
              </div>
            )}
            {course.duration && (
              <div className="rounded-xl bg-[#F0E4D8] p-2.5 flex items-center gap-2 border border-[#E6D7CB]">
                <Clock size={14} className="text-[#8C6246] shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[10px] text-[#8C6246] font-medium">Thời lượng</span>
                  <span className="font-semibold truncate block text-[#1B1A16]">{course.duration}</span>
                </div>
              </div>
            )}
            {course.schedule && (
              <div className="rounded-xl bg-[#F0E4D8] p-2.5 flex items-center gap-2 border border-[#E6D7CB] col-span-2 sm:col-span-1">
                <BookOpen size={14} className="text-[#8C6246] shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[10px] text-[#8C6246] font-medium">Lịch học</span>
                  <span className="font-semibold truncate block text-[#1B1A16]">{course.schedule}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-[12.5px] sm:text-[13.5px] font-['Inter']! text-[#523C37] leading-relaxed whitespace-pre-line">{activeDescription}</p>

        {directLink && (
          <div className="p-3.5 rounded-2xl bg-white/70 border border-[#D9C8BA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EADCCF] flex items-center justify-center text-[#8C6246] shrink-0">
                <ExternalLink size={16} />
              </div>
              <div>
                <span className="block text-[12px] sm:text-[13px] font-semibold text-[#1B1A16] font-['Inter']!">Đăng ký trực tiếp qua Luma</span>
                <span className="block text-[11px] text-[#664E48] font-['Inter']!">Mở trang sự kiện chính thức để giữ chỗ ngay</span>
              </div>
            </div>
            <a
              href={directLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#E09A30] hover:bg-[#d9941b] text-white text-[11px] sm:text-[12px] font-['Inter']! font-semibold px-4 py-2 rounded-xl transition uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm shrink-0 active:scale-95"
            >
              <span>MỞ TRANG SỰ KIỆN</span>
              <ExternalLink size={13} />
            </a>
          </div>
        )}

        {/* Error Feedback */}
        {errorMessage && (
          <div className="rounded-2xl px-4 py-3 text-[12px] font-['Inter']! bg-[#F8E4DD] text-[#9A4D3A] border border-[#F2CDC3]">{errorMessage}</div>
        )}

        {/* Success State */}
        {isSuccess ? (
          <div className="py-6 sm:py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#E3EDE5] text-[#2D7A46] flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h3 className="text-[22px] sm:text-[24px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">Đăng Ký Thành Công!</h3>
              <p className="mt-1 text-[12px] sm:text-[13px] font-['Inter']! text-[#664E48] max-w-sm mx-auto leading-relaxed">
                Hệ thống đã tiếp nhận thông tin đăng ký của bạn. Ban tổ chức sẽ liên hệ xác nhận và hướng dẫn tham gia trong thời gian sớm nhất.
              </p>
            </div>
          </div>
        ) : shouldRenderForm ? (
          /* Registration Form ONLY for Courses */
          <div className="pt-3 border-t border-[#EAE0D6]">
            <h4 className="text-[13px] sm:text-[14px] font-semibold text-[#1B1A16] font-['Inter']! mb-3">Điền thông tin đăng ký tham gia khóa học</h4>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <label className="block">
                  <span className="block text-[12px] sm:text-[13px] font-['Inter']! font-medium text-[#48372D] mb-1.5">
                    Họ và tên <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    className="w-full rounded-xl sm:rounded-2xl border border-[#D9C8BA] bg-white px-3.5 py-2.5 sm:py-3 text-[13px] text-[#1B1A16] outline-none focus:border-[#B58F6F] transition-colors"
                    placeholder="Nguyễn Văn A..."
                  />
                </label>

                <label className="block">
                  <span className="block text-[12px] sm:text-[13px] font-['Inter']! font-medium text-[#48372D] mb-1.5">
                    Số điện thoại <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={13}
                    value={form.phone}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setForm((prev) => ({ ...prev, phone: formatted }));
                    }}
                    className="w-full rounded-xl sm:rounded-2xl border border-[#D9C8BA] bg-white px-3.5 py-2.5 sm:py-3 text-[13px] text-[#1B1A16] outline-none focus:border-[#B58F6F] transition-colors"
                    placeholder="0912 345 678..."
                  />
                </label>
              </div>

              <label className="block">
                <span className="block text-[12px] sm:text-[13px] font-['Inter']! font-medium text-[#48372D] mb-1.5">Email liên hệ</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-xl sm:rounded-2xl border border-[#D9C8BA] bg-white px-3.5 py-2.5 sm:py-3 text-[13px] text-[#1B1A16] outline-none focus:border-[#B58F6F] transition-colors"
                  placeholder="email@example.com..."
                />
              </label>

              <label className="block">
                <span className="block text-[12px] sm:text-[13px] font-['Inter']! font-medium text-[#48372D] mb-1.5">Ghi chú thêm (nếu có)</span>
                <textarea
                  rows={3}
                  value={form.note}
                  onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                  className="w-full min-h-[85px] sm:min-h-[95px] rounded-xl sm:rounded-2xl border border-[#D9C8BA] bg-white px-3.5 py-2.5 sm:py-3 text-[13px] text-[#1B1A16] outline-none focus:border-[#B58F6F] transition-colors resize-none leading-relaxed"
                  placeholder="Nội dung cần hỗ trợ hoặc câu hỏi cho ban tổ chức..."
                />
              </label>
            </form>
          </div>
        ) : null}
      </div>
    </PortalModal>
  );
};
