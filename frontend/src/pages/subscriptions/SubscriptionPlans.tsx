import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  description: string;
}

export function SubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{title: string, type: 'success' | 'error'} | null>(null);
  const [activePlanName, setActivePlanName] = useState<string>('Free'); // Default to Free
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      setToastMessage({ title: 'Payment successful! Your membership is active.', type: 'success' });
      searchParams.delete('payment');
      setSearchParams(searchParams, { replace: true });
    } else if (paymentStatus === 'failed') {
      setToastMessage({ title: 'Payment failed or was cancelled.', type: 'error' });
      searchParams.delete('payment');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await apiClient.get('/subscriptions/plans');
        if (data.success) {
          setPlans(data.data);
        }
      } catch (err) {
        console.error("Failed to load plans", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchActiveSubscription = async () => {
      if (!user) {
        setActivePlanName('Free');
        return;
      }
      try {
        const { data } = await apiClient.get('/subscriptions/me');
        if (data.success && data.data && data.data.is_active && data.data.plan) {
          setActivePlanName(data.data.plan.name);
        } else {
          setActivePlanName('Free');
        }
      } catch (err) {
        setActivePlanName('Free');
      }
    };
    fetchActiveSubscription();
  }, [user]);

  const handlePurchase = async (dbPlanName: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const dbPlan = plans.find(p => p.name === dbPlanName);
    if (!dbPlan) {
      alert("Plan not found in database.");
      return;
    }

    setPurchasing(dbPlan.id);
    try {
      // 1. Create Subscription
      const subRes = await apiClient.post('/subscriptions/purchase', { plan_id: dbPlan.id });
      const subId = subRes.data.data.subscription_id;

      // 2. Create Payment Intent via OnePay
      const payRes = await apiClient.post('/payments/create', {
        subscription_id: subId,
        amount: dbPlan.price,
        currency: 'VND',
        gateway: 'onepay'
      });

      const paymentUrl = payRes.data.data.payment_url;
      // Redirect directly to OnePay payment gateway
      window.location.href = paymentUrl;

    } catch (err: any) {
      alert(err.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const cards = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      duration: 'Time: 1 year',
      features: ['Dashboard', 'Newsletter', 'Light report', 'Webinar'],
      dbName: 'Free',
    },
    {
      id: 'base',
      name: 'Base',
      price: '$1',
      duration: 'Time: 1 year',
      features: ['Dashboard', 'Newsletter', 'Light report', 'Webinar'],
      dbName: 'Monthly Basic',
    },
    {
      id: 'standard',
      name: 'Standard',
      price: '$500',
      duration: 'Time: 1 year',
      features: ['Dashboard', 'Newsletter', 'Webinar', 'Full report', 'Exclusive Event'],
      dbName: 'Quarterly Pro',
      isPopular: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$2500',
      duration: '',
      features: ['Waiting list'],
      dbName: 'Annual Premium',
    }
  ];

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center p-10 text-center font-sans text-white text-2xl tracking-widest animate-pulse">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#111] bg-cover bg-center bg-no-repeat flex flex-col font-sans relative" style={{ backgroundImage: "url('/bg.png')" }}>
      <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-8 right-8 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 transition-all duration-300 animate-in fade-in slide-in-from-top-4
          ${toastMessage.type === 'success' ? 'bg-[#18181b] border border-white/20' : 'bg-[#18181b] border border-red-500/50'}`}>
          {toastMessage.type === 'success' ? (
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold">✓</div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">!</div>
          )}
          <span className="text-white text-[15px] font-medium">{toastMessage.title}</span>
          <button onClick={() => setToastMessage(null)} className="ml-4 text-[#a1a1aa] hover:text-white transition text-xl">&times;</button>
        </div>
      )}

      <Navbar />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-6 md:px-12 max-w-[1500px] mx-auto w-full pb-24 pt-4">

        {/* Page Title */}
        <div className="text-center mb-12 mt-12 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">Subscription</h1>
        </div>

        {/* 4-Column Pricing Cards Layout */}
        <div className="grid grid-cols-1 mt-20 md:grid-cols-2 lg:grid-cols-4 gap-[29px] w-full max-w-full items-center justify-items-center">
          {cards.map((card) => {
            const isCurrentPlan = activePlanName === card.dbName;
            const isPopular = card.isPopular;

            return (
              <div key={card.id} className={`relative flex flex-col items-center ${isPopular ? 'h-[440px]' : 'h-[360px]'}`}>

                {/* Card Body */}
                <div className={`relative p-6 rounded-[2.5rem] backdrop-blur-md border transition-all flex flex-col overflow-hidden w-[327px] max-w-full h-full
                  ${isPopular
                    ? 'bg-[#404040]/80 border-white/10 shadow-2xl'
                    : 'bg-[#151515]/80 border-white/5 text-white'
                  }`}>

                  {/* Background 3D shape decoration */}
                  <img
                    src={isPopular ? '/center-card-shape.png' : '/side-card-shape.png'}
                    alt="Decorative glass shape"
                    className={`absolute pointer-events-none z-0
                      ${isPopular ? '-bottom-12 -right-16 w-80 h-80 object-cover' : '-bottom-12 -right-12 w-72 h-72 object-cover'}`}
                  />

                  <div className="relative z-10 flex-1 flex flex-col">

                    {/* Popular Pill Label */}
                    {isPopular && (
                      <div className="mb-3 self-start">
                        <span className="px-4 py-1.5 rounded-full border border-white/20 text-white text-[13px] font-medium tracking-wide">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Card Title & Current Plan Tag */}
                    <div className="flex items-center gap-3 mb-1.5 mt-2">
                      <h3 className="text-3xl text-white font-normal tracking-wide">{card.name}</h3>
                      {isCurrentPlan && (
                        <span className="bg-white/10 border border-white/5 text-gray-300 text-[11px] font-medium px-2.5 py-1 rounded-md">
                          Current plan
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline text-[2.75rem] font-bold text-white mb-2 tracking-tight">
                      <span>{card.price}</span>
                    </div>

                    {/* Duration / Line */}
                    <div className="border-b border-white/10 pb-4 mb-4">
                      <p className="text-[#a1a1aa] text-[15px] font-medium h-6">
                        {card.duration}
                      </p>
                    </div>

                    {/* Features list */}
                    <ul className="flex flex-col gap-3">
                      {card.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-[#d1d1d1] text-[15px]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                  </div>
                </div>

                {/* Overlapping explore button (only if not current plan and not free card) */}
                {!isCurrentPlan && card.id !== 'free' && (
                  <div className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 z-20 w-max">
                    <button
                      className={`px-8 py-[13px] rounded-full text-[15px] font-medium transition-colors flex justify-center items-center gap-2 min-w-[200px] border cursor-pointer shadow-md
                        ${isPopular
                          ? 'bg-white text-black hover:bg-gray-200 border-white'
                          : 'bg-[#2d2a2a] text-white border-white/10 hover:bg-[#3d3a3a]'
                        }`}
                      onClick={() => handlePurchase(card.dbName)}
                      disabled={purchasing !== null}
                    >
                      {purchasing === card.dbName ? 'Processing...' : 'Explore Membership'}
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
