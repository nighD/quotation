import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { Link, useNavigate } from 'react-router-dom';

interface Subscription {
  id: string;
  plan: {
    name: string;
    description: string;
    duration_days: number;
    price: number;
  };
  start_date: string;
  end_date: string;
  status: string;
  is_active: boolean;
}

export function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data } = await apiClient.get('/subscriptions/me');
        if (data.success) {
          setSubscription(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch subscription", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="border-b-8 border-verge-magenta pb-6 mb-16">
        <h2 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter text-verge-white leading-none mb-4">
          Operator <span className="text-verge-neon">Dossier</span>
        </h2>
        <p className="font-sans text-gray-400 text-lg uppercase tracking-widest">Confidential Identity Matrix</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* User Info Card */}
        <div className="verge-card border-verge-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-3xl font-display font-black uppercase tracking-widest text-verge-white">Identity</h3>
            <span className="bg-verge-white text-verge-black font-display font-black uppercase tracking-widest text-xs px-3 py-1">Active</span>
          </div>
          
          <div className="space-y-6">
            <div>
              <p className="text-verge-magenta font-sans uppercase tracking-widest text-xs font-bold mb-1">Full Name</p>
              <p className="text-2xl font-display uppercase tracking-wider">{user.full_name}</p>
            </div>
            <div>
              <p className="text-verge-magenta font-sans uppercase tracking-widest text-xs font-bold mb-1">Access Protocol (Email)</p>
              <p className="text-xl font-display text-gray-300">{user.email}</p>
            </div>
            <div>
              <p className="text-verge-magenta font-sans uppercase tracking-widest text-xs font-bold mb-1">Unique Identifier</p>
              <p className="text-sm font-sans text-gray-500 font-mono">{user.id}</p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-800">
            <button 
              onClick={handleLogout}
              className="font-display uppercase tracking-widest text-sm text-verge-magenta hover:text-white transition-colors"
            >
              Terminate Session (Logout)
            </button>
          </div>
        </div>

        {/* Subscription Status Card */}
        <div className={`verge-card flex flex-col ${subscription?.is_active ? 'border-verge-neon shadow-[8px_8px_0px_0px_rgba(57,255,20,1)] bg-verge-gray/50' : 'border-verge-magenta shadow-[8px_8px_0px_0px_rgba(232,18,92,1)]'}`}>
          <div className="mb-8">
            <h3 className="text-3xl font-display font-black uppercase tracking-widest mb-2">Clearance</h3>
            {!loading && (
              <span className={`inline-block font-display font-black uppercase tracking-widest text-xs px-3 py-1 ${subscription?.is_active ? 'bg-verge-neon text-verge-black' : 'bg-verge-magenta text-white'}`}>
                {subscription?.is_active ? 'Granted' : 'Restricted'}
              </span>
            )}
          </div>

          {loading ? (
            <div className="animate-pulse text-gray-500 font-display uppercase tracking-widest text-sm">Scanning mainframe...</div>
          ) : subscription?.is_active ? (
            <div className="flex-1 flex flex-col">
              <p className="text-verge-magenta font-sans uppercase tracking-widest text-xs font-bold mb-1">Current Tier</p>
              <div className="mb-6">
                <p className="text-4xl font-display font-black uppercase text-verge-neon mb-1">{subscription.plan.name}</p>
                <p className="font-sans text-gray-400 uppercase tracking-widest text-sm flex items-center gap-2">
                  <span>{subscription.plan.duration_days === 30 ? 'Monthly' : subscription.plan.duration_days === 365 ? 'Yearly' : `${subscription.plan.duration_days} Days`} Access</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-verge-white font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subscription.plan.price)}</span>
                </p>
              </div>
              
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="font-sans text-gray-400 text-sm">Activation Date</span>
                  <span className="font-display text-white">{new Date(subscription.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="font-sans text-gray-400 text-sm">Expiration Date</span>
                  <span className="font-display text-verge-magenta">{new Date(subscription.end_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ) : subscription?.status === 'pending' ? (
            <div className="flex-1 flex flex-col">
              <p className="text-gray-400 font-sans leading-relaxed mb-8">
                Your payment is currently <span className="text-verge-neon">processing</span>. Please wait for the gateway to confirm your clearance.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <p className="text-gray-400 font-sans leading-relaxed mb-8">
                Your current access level is strictly basic. You do not have clearance to intercept premium signals or access restricted intel.
              </p>
            </div>
          )}

          <Link 
            to="/plans" 
            className={`verge-button text-center w-full mt-auto ${subscription?.is_active ? 'border-verge-neon text-verge-neon hover:bg-verge-neon hover:text-black' : 'bg-verge-magenta border-verge-magenta text-white hover:bg-white hover:text-black hover:border-white'}`}
          >
            {subscription?.is_active ? 'Extend Clearance' : 'Acquire Clearance'}
          </Link>
        </div>
      </div>
    </div>
  );
}
