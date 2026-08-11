import { useEffect, useState } from 'react';
import { apiClient } from '../../../api/client';
import { AdminLayout } from '../_layouts';
import {
  BookingSection,
  EventSection,
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
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await apiClient.get('/admin/dashboard');
        if (data.success) setStats(data.data);
      } catch (err: any) {
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // if (loading) {
  //   return (
  //     <div className="flex h-screen items-center justify-center bg-[#F2E8E0] text-[#3C2A25]">
  //       <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#B58F6F] border-t-transparent" />
  //     </div>
  //   );
  // }

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
        <BookingSection />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[700px_minmax(0,1fr)] gap-4 items-stretch">
        <ReportSection />

        <div className="flex flex-col gap-4 w-full min-w-0">
          <EventSection />
          <PrivateClubSection />
        </div>
      </div>
    </div>
  );
}
