import { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';

interface DashboardStats {
  total_users: number;
  active_users: number;
  total_revenue: number;
  active_subscriptions: number;
  total_articles: number;
  new_users_today: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await apiClient.get('/admin/dashboard');
        if (data.success) setStats(data.data);
      } catch (err: any) {
        setError('Failed to load dashboard metrics. Are you an admin?');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="container">Loading dashboard...</div>;

  return (
    <div className="container">
      <h2 className="mb-4">Admin Dashboard</h2>
      {error && <div className="error-text">{error}</div>}
      
      {stats && (
        <div className="grid">
          <div className="card text-center">
            <h3 style={{ margin: 0, color: '#94a3b8', fontSize: '1rem' }}>Total Users</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.total_users}</p>
            <span style={{ color: 'var(--success)' }}>+{stats.new_users_today} today</span>
          </div>
          <div className="card text-center">
            <h3 style={{ margin: 0, color: '#94a3b8', fontSize: '1rem' }}>Active Subscriptions</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.active_subscriptions}</p>
          </div>
          <div className="card text-center">
            <h3 style={{ margin: 0, color: '#94a3b8', fontSize: '1rem' }}>Total Revenue</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#10b981' }}>
              ₫{stats.total_revenue.toLocaleString()}
            </p>
          </div>
          <div className="card text-center">
            <h3 style={{ margin: 0, color: '#94a3b8', fontSize: '1rem' }}>Total Articles</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.total_articles}</p>
          </div>
        </div>
      )}
    </div>
  );
}
