import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';

interface NewsletterSubscription {
  id: string;
  email: string;
  full_name: string;
  source: string;
  status: string;
  created_at: string;
}

const formatDate = (value: string) => {
  if (!value) return 'Just now';
  try {
    return new Date(value).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
};

export function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchSubscribers = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const { data } = await apiClient.get('/admin/notifications/newsletter');
        if (data.success) {
          setItems(data.data || []);
        }
      } catch (error: any) {
        const status = error.response?.status;
        if (status !== 403) {
          setFetchError(error.response?.data?.message || 'Failed to load newsletter data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, []);

  const isSubscribed = useMemo(() => {
    if (!user?.email) return false;
    return items.some((item) => item.email === user.email);
  }, [items, user?.email]);

  const handleSubscribe = async () => {
    setSubscribing(true);
    setMessage(null);
    try {
      const { data } = await apiClient.post('/engagement/newsletter/subscribe', {
        source: 'admin-notifications',
      });

      if (data.success && data.data) {
        const nextItem = data.data as NewsletterSubscription;
        setItems((prev) => {
          const withoutCurrent = prev.filter((item) => item.email !== nextItem.email);
          return [nextItem, ...withoutCurrent];
        });
        setMessage({ type: 'success', text: 'Newsletter subscription saved for admin follow-up.' });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to save newsletter subscription.',
      });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="w-full pb-8">
      <div className="mb-8 select-none">
        <h1 className="font-['Cormorant_Garamond']! text-[36px] md:text-[40px] font-semibold! text-[#1B1A16] mb-2 leading-tight">
          Notifications
        </h1>
        <p className="font-['Inter']! text-[13px] md:text-md text-[#523C37] font-normal! leading-relaxed max-w-190">
          Lưu danh sách user đăng ký nhận newsletter để admin chủ động chăm sóc và gửi email thủ công.
        </p>
      </div>

      {message && (
        <div className={`mb-4 rounded-2xl px-4 py-3 text-[13px] font-['Inter']! ${message.type === 'success'
          ? 'bg-[#E8D7C9] text-[#523C37]'
          : 'bg-[#F8E4DD] text-[#9A4D3A]'
          }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-4">
        <section className="rounded-[28px] bg-white p-6 shadow-sm border border-[#EADFD5]">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-[11px] font-['Inter']! uppercase tracking-[0.2em] text-[#B58F6F]">Newsletter</p>
              <h2 className="mt-2 text-[28px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">
                Subscribe current user
              </h2>
            </div>
            <div className="rounded-full bg-[#F5ECE5] px-4 py-2 text-[12px] font-['Inter']! text-[#523C37]">
              {items.length} subscribers
            </div>
          </div>

          <div className="rounded-3xl bg-[#F8F1EA] border border-[#E7D8CC] p-5 mb-4">
            <p className="text-[11px] font-['Inter']! uppercase tracking-[0.18em] text-[#B58F6F]">Current account</p>
            <h3 className="mt-2 text-[24px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">
              {user?.full_name || 'Current user'}
            </h3>
            <p className="mt-1 text-[13px] font-['Inter']! text-[#664E48]">{user?.email || 'No email available'}</p>
          </div>

          <button
            type="button"
            disabled={subscribing || isSubscribed}
            onClick={handleSubscribe}
            className={`w-full rounded-2xl px-5 py-4 text-[12px] font-['Inter']! font-medium uppercase tracking-[0.18em] text-white transition cursor-pointer ${isSubscribed
              ? 'bg-[#2F4B3C] cursor-default'
              : 'bg-[#523C37] hover:bg-[#382b24]'
              }`}
          >
            {isSubscribed ? 'Subscribed' : subscribing ? 'Saving...' : 'Đăng ký nhận newsletter'}
          </button>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-sm border border-[#EADFD5] min-w-0">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-[11px] font-['Inter']! uppercase tracking-[0.2em] text-[#B58F6F]">Admin list</p>
              <h2 className="mt-2 text-[28px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">
                Newsletter subscribers
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-[#F8F1EA] p-5 text-[13px] font-['Inter']! text-[#664E48]">Loading subscribers...</div>
          ) : fetchError ? (
            <div className="rounded-2xl bg-[#F8E4DD] p-5 text-[13px] font-['Inter']! text-[#9A4D3A]">{fetchError}</div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl bg-[#F8F1EA] p-5 text-[13px] font-['Inter']! text-[#664E48]">No subscribers saved yet.</div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-3xl bg-[#F8F1EA] border border-[#E7D8CC] p-4 flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-[22px] font-['Cormorant_Garamond']! font-semibold! text-[#1B1A16]">
                      {item.full_name || 'Newsletter user'}
                    </h3>
                    <p className="mt-1 text-[13px] font-['Inter']! text-[#523C37]">{item.email}</p>
                  </div>

                  <div className="text-right">
                    <div className="inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-['Inter']! uppercase tracking-[0.18em] text-[#B58F6F]">
                      {item.source}
                    </div>
                    <p className="mt-2 text-[11px] font-['Inter']! text-[#664E48]">{formatDate(item.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}