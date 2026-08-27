import { useEffect, useState } from "react";
import { apiClient } from "../../../api/client";
import {
  CourseSection,
  type BookingCardRequest,
  EventSection,
  type EventItemData,
  MembershipBenefitCard,
  PrivateClubSection,
  ReportSection,
} from "./_components";
import { useAuth } from "../../../context/AuthContext";

interface DashboardStats {
  total_users: number;
  active_users: number;
  total_revenue: number;
  active_subscriptions: number;
  total_articles: number;
  new_users_today: number;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [_stats, setStats] = useState<DashboardStats | null>(null);
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState("");
  const [submittingBookingType, setSubmittingBookingType] = useState<string | null>(null);
  const [requestedBookingTypes, setRequestedBookingTypes] = useState<string[]>([]);
  const [joiningEventId, setJoiningEventId] = useState<string | null>(null);
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, bookingResponse, eventResponse] = await Promise.all([
          apiClient.get("/admin/dashboard"),
          apiClient.get("/engagement/booking-requests/me"),
          apiClient.get("/engagement/events/register"),
        ]);

        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }

        if (bookingResponse.data.success && Array.isArray(bookingResponse.data.data)) {
          const bookingTypes = bookingResponse.data.data
            .map((item: { booking_type?: string }) => item.booking_type)
            .filter((bookingType: string | undefined): bookingType is string => Boolean(bookingType));
          setRequestedBookingTypes(Array.from(new Set(bookingTypes)));
        }

        if (eventResponse.data.success && Array.isArray(eventResponse.data.data)) {
          const eventIds = eventResponse.data.data
            .map((item: { event_id?: string }) => item.event_id)
            .filter((eventID: string | undefined): eventID is string => Boolean(eventID));
          setJoinedEventIds(Array.from(new Set(eventIds)));
        }
      } catch (_err: any) {
        setError("Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleJoinEvent = async (event: EventItemData) => {
    setJoiningEventId(event.id);

    try {
      const { data } = await apiClient.post("/engagement/events/register", {
        event_id: event.id,
        event_title: event.title,
        event_date: event.date,
        location: event.location,
      });

      if (data.success) {
        setJoinedEventIds((prev) => (prev.includes(event.id) ? prev : [...prev, event.id]));
      }
    } catch (_error: any) {
    } finally {
      setJoiningEventId(null);
    }
  };

  const handleBookingRequest = async (request: BookingCardRequest) => {
    setSubmittingBookingType(request.bookingType);

    try {
      const { data } = await apiClient.post("/engagement/booking-requests", {
        booking_type: request.bookingType,
        booking_title: request.bookingTitle,
        note: request.note || "",
        source: "admin-dashboard",
      });

      if (data.success) {
        setRequestedBookingTypes((prev) => (prev.includes(request.bookingType) ? prev : [...prev, request.bookingType]));
      }
    } catch (_error: any) {
    } finally {
      setSubmittingBookingType(null);
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <header className="px-1 py-1 sm:py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <h1 className="font-['Cormorant_Garamond']! tracking-tight">
          <span className="italic text-[20px] sm:text-[22px] md:text-[24px] font-semibold! text-[#B58F6F] opacity-90">Xin chào,</span>{" "}
          <span className="text-[24px] sm:text-[28px] md:text-[30px] font-semibold! bg-linear-to-r from-[#3C2A25] to-[#2E211D] bg-clip-text text-transparent">
            {user?.full_name ? `${user.full_name} (${user.roles?.includes("admin") ? "Admin" : "User"})` : "Hoàng Vương (Admin)"}
          </span>
        </h1>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        <div className="xl:col-span-5 2xl:col-span-5 flex">
          <MembershipBenefitCard />
        </div>
        <div className="xl:col-span-7 2xl:col-span-7 flex">
          <CourseSection onSubmitRequest={handleBookingRequest} submittingBookingType={submittingBookingType} requestedBookingTypes={requestedBookingTypes} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        <div className="xl:col-span-5 2xl:col-span-5 flex">
          <ReportSection />
        </div>

        <div className="xl:col-span-7 2xl:col-span-7 flex flex-col gap-4 sm:gap-6 w-full min-w-0">
          <EventSection onJoin={handleJoinEvent} joiningEventId={joiningEventId} joinedEventIds={joinedEventIds} />
          <PrivateClubSection />
        </div>
      </div>
    </div>
  );
}
