export interface BookingCardRequest {
  bookingType: string;
  bookingTitle: string;
  note?: string;
}

export interface CourseCardItem {
  id?: string;
  bookingType: string;
  bookingTitle: string;
  title: string;
  description: string;
  image: string;
  fallbackImage?: string;
  instructor?: string;
  duration?: string;
  schedule?: string;
  tuitionFee?: number;
  status?: string;
  orderIndex?: number;
}

export interface CourseSectionProps {
  onSubmitRequest: (request: BookingCardRequest) => void | Promise<void>;
  submittingBookingType: string | null;
  requestedBookingTypes: string[];
  initialCourses?: CourseCardItem[];
}