import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

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
          // Sort plans by price if they are not already sorted, to ensure Pro is in middle (optional but good idea)
          const sorted = data.data.sort((a: Plan, b: Plan) => a.price - b.price);
          setPlans(sorted);
        }
      } catch (err) {
        console.error("Failed to load plans", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePurchase = async (planId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setPurchasing(planId);
    try {
      // 1. Create Subscription
      const subRes = await apiClient.post('/subscriptions/purchase', { plan_id: planId });
      const subId = subRes.data.data.subscription_id;

      // 2. Create Payment Intent via OnePay
      const payRes = await apiClient.post('/payments/create', {
        subscription_id: subId,
        amount: plans.find(p => p.id === planId)?.price || 0,
        currency: 'VND', // API might still expect VND, depending on the backend config
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center p-10 text-center font-sans text-white text-2xl tracking-widest animate-pulse">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#111] bg-cover bg-center bg-no-repeat flex flex-col font-sans relative" style={{ backgroundImage: "url('/bg.png')" }}>
      {/* Dark overlay for readability */}
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

      {/* Header from mockup */}
      <header className="relative z-10 flex items-center justify-center px-6 md:px-12 py-8 max-w-[1400px] mx-auto w-full">
        <div className="absolute left-6 md:left-12">
          <Link to="/" className="text-2xl font-bold tracking-widest text-white hover:text-gray-300 transition">VIFC</Link>
        </div>
        
        {/* Floating Pill Navigation */}
        <div className="flex items-center gap-8 bg-[#18181b]/80 backdrop-blur-md border border-white/10 rounded-full p-1.5 pl-8 shadow-xl">
          <div className="flex gap-8 text-[14px] text-[#d1d1d1] font-medium items-center">
            <a href="#" className="hover:text-white transition">Benefits</a>
            <a href="#" className="hover:text-white transition">How it works</a>
            <a href="#" className="hover:text-white transition">Pricing</a>
            <a href="#" className="hover:text-white transition">Memberships</a>
          </div>
          <button className="bg-white text-black px-6 py-2.5 rounded-full font-medium text-[14px] hover:bg-gray-200 transition ml-2">
            Explore Membership
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-6xl mx-auto w-full pb-24 pt-8">
        <div className="text-center mb-16 max-w-2xl">
          <h1 className="text-7xl md:text-[5.5rem] mb-6 text-white tracking-tight">Pricing</h1>
          <p className="text-[#d1d1d1] text-[17px] leading-[1.6]">
            A private membership for people who live across borders, seamless spend,
            <br className="hidden md:block" /> plus concierge access to hotels, experiences, and privileges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {plans.map((plan, i) => {
            const isPro = i === 1; // Assuming the middle plan is Pro
            return (
              <div key={plan.id} className="relative pb-6 flex flex-col h-full">
                {/* Card Body */}
                <div className={`relative p-8 pb-14 rounded-[2.5rem] backdrop-blur-md border transition-all flex-1 flex flex-col overflow-hidden
                  ${isPro ? 'bg-[#404040]/80 border-white/10 shadow-2xl md:-mt-4' : 'bg-[#151515]/80 border-white/5'}`}>
                  
                  {/* 3D Glass Shape inside the card */}
                  <img 
                    src={isPro ? '/center-card-shape.png' : '/side-card-shape.png'} 
                    alt="Decorative glass shape" 
                    className={`absolute pointer-events-none z-0
                      ${isPro ? '-bottom-12 -right-16 w-80 h-80 object-cover' : '-bottom-6 -right-10 w-72 h-72 object-contain'}`}
                  />

                  <div className="relative z-10 flex-1 flex flex-col">
                    {isPro && (
                      <div className="mb-4">
                        <span className="px-4 py-1.5 rounded-full border border-white/30 text-white text-[13px] font-medium tracking-wide">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <h3 className={`text-3xl text-white mb-2 tracking-wide font-thin ${!isPro ? 'mt-10' : ''}`}>{plan.name}</h3>
                    <div className="flex items-baseline text-[2.75rem] font-bold text-white mb-8 tracking-tight">
                      <span className="text-3xl mr-1 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>$</span>
                      <span>{i === 0 ? '49.00' : i === 1 ? '120.00' : '500.00'}</span>
                    </div>
                    
                    <div className="border-b border-white/10 pb-6 mb-6">
                      <p className="text-[#a1a1aa] text-[16px]">Duration: {plan.duration_days} days</p>
                    </div>
                    
                    <p className="text-[#a1a1aa] text-[16px] mb-4 leading-relaxed">
                      {plan.description || (isPro ? 'Pro access for 90 days' : i === 0 ? 'Basic access for 30 days' : 'Premium access for 1 year')}
                    </p>
                  </div>
                </div>

                {/* Absolute overlapping button */}
                <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 z-20 w-max">
                  <button 
                    className={`px-8 py-[14px] rounded-full text-[15px] font-medium transition-colors flex justify-center items-center gap-2 min-w-[220px]
                      ${isPro ? 'bg-white text-black hover:bg-gray-200' : 'bg-[#4a4a4a] text-white hover:bg-[#5a5a5a]'}`}
                    onClick={() => handlePurchase(plan.id)}
                    disabled={purchasing === plan.id}
                  >
                    {purchasing === plan.id ? 'Processing...' : 'Explore Membership'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
