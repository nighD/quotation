import { useEffect, useState } from 'react';
import { apiClient } from '../../../api/client';
import {
  BookingSection,
  type BookingCardRequest,
  EventSection,
  type EventItemData,
  MembershipBenefitCard,
  PrivateClubSection,
  ReportSection,
} from './_components';
import { useAuth } from '../../../context/AuthContext';

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
  const [_error, setError] = useState('');
  const [submittingBookingType, setSubmittingBookingType] = useState<string | null>(null);
  const [requestedBookingTypes, setRequestedBookingTypes] = useState<string[]>([]);
  const [joiningEventId, setJoiningEventId] = useState<string | null>(null);
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, bookingResponse, eventResponse] = await Promise.all([
          apiClient.get('/admin/dashboard'),
          apiClient.get('/engagement/booking-requests/me'),
          apiClient.get('/engagement/events/register'),
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
      } catch (err: any) {
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // if (loading) {
  //   return (
  //     <div className="flex h-screen items-center justify-center bg-[#F2E8E0] text-[#3C2A25]">
  //       <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#B58F6F] border-t-transparent" />
  //     </div>
  //   );
  // }

  const handleJoinEvent = async (event: EventItemData) => {
    setJoiningEventId(event.id);

    try {
      const { data } = await apiClient.post('/engagement/events/register', {
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
      const { data } = await apiClient.post('/engagement/booking-requests', {
        booking_type: request.bookingType,
        booking_title: request.bookingTitle,
        source: 'admin-dashboard',
      });

      if (data.success) {
        setRequestedBookingTypes((prev) => (
          prev.includes(request.bookingType) ? prev : [...prev, request.bookingType]
        ));
      }
    } catch (_error: any) {
    } finally {
      setSubmittingBookingType(null);
    }
  };

  return (
    <div className="w-full">
      <header className="mb-4 px-2 py-2 flex items-center justify-between">
        <h1 className="font-['Cormorant_Garamond']!">
          <span className="italic text-[20px] font-semibold! text-[#B58F6F] opacity-85">Xin chào,</span>{' '}
          <span className="text-[24px] font-semibold! bg-linear-to-r from-[#3C2A25] to-[#2E211D] bg-clip-text text-transparent">
            {user?.full_name || 'Hoàng Vương (Admin)'}
          </span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[600px_1fr] gap-4 mb-4 items-stretch">
        <MembershipBenefitCard />
        <BookingSection
          onSubmitRequest={handleBookingRequest}
          submittingBookingType={submittingBookingType}
          requestedBookingTypes={requestedBookingTypes}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[700px_minmax(0,1fr)] gap-4 items-stretch">
        <ReportSection />

        <div className="flex flex-col gap-4 w-full min-w-0">
          <EventSection onJoin={handleJoinEvent} joiningEventId={joiningEventId} joinedEventIds={joinedEventIds} />
          <PrivateClubSection />
        </div>
      </div>
    </div>
  );
}
