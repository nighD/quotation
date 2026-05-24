import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { ChevronDown } from 'lucide-react';

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
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  // Form states
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [country, setCountry] = useState('Vietnam');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        setLoadingSubscription(false);
      }
    };

    if (user) {
      fetchSubscription();
      setFullName(user.full_name || '');
      setCompany(user.company || '');
      setTitle(user.title || '');
      setCountry(user.country || 'Vietnam');
    }
  }, [user]);

  if (!user || loadingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#181818] text-white flex flex-col">
        <Navbar hideCenterNav={true} />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await apiClient.put('/auth/profile', {
        full_name: fullName,
        company,
        title,
        country
      });
      if (data.success) {
        // GORM/Fiber API returns updated user inside data.data
        setUser(data.data);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (err: any) {
      console.error("Failed to update profile", err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to connect to the server'
      });
    } finally {
      setSaving(false);
    }
  };

  const isPremiumActive = subscription && subscription.is_active;
  const activePlanDbName = isPremiumActive ? subscription.plan.name : "Free";

  // Map database plan name to our local key (Free, Base, Standard, Premium)
  let planKey: 'Free' | 'Base' | 'Standard' | 'Premium' = 'Free';
  if (activePlanDbName === 'Monthly Basic') {
    planKey = 'Base';
  } else if (activePlanDbName === 'Quarterly Pro') {
    planKey = 'Standard';
  } else if (activePlanDbName === 'Annual Premium') {
    planKey = 'Premium';
  }

  const planDuration = isPremiumActive
    ? (subscription.plan.duration_days === 365 ? "1 year" : `${subscription.plan.duration_days} days`)
    : "1 year";

  const planConfigs: Record<'Free' | 'Base' | 'Standard' | 'Premium', {
    displayName: string;
    buttonLabel?: string;
    hasDuration: boolean;
    image?: string;
    features: string[];
  }> = {
    Free: {
      displayName: 'Free',
      buttonLabel: 'Upgrade ↗',
      hasDuration: true,
      features: ['Dashboard', 'Light report', 'Newsletter', 'Webinar'],
    },
    Base: {
      displayName: 'Base',
      buttonLabel: 'Upgrade ↗',
      hasDuration: true,
      features: ['Dashboard', 'Full report', 'Newsletter', 'Exclusive Event', 'Webinar'],
    },
    Standard: {
      displayName: 'Standard',
      buttonLabel: 'Upgrade ↗',
      hasDuration: true,
      image: '/standard.png',
      features: ['Dashboard', 'Full report', 'Newsletter', 'Exclusive Event', 'Webinar'],
    },
    Premium: {
      displayName: 'Premium 👑',
      hasDuration: false,
      image: '/premium.png',
      features: ['Waiting list'],
    },
  };

  const config = planConfigs[planKey];

  return (
    <div className="min-h-screen bg-[#111] bg-cover bg-center bg-no-repeat flex flex-col text-white relative font-sans" style={{ backgroundImage: "url('/bg.png')" }}>
      <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar hideCenterNav={true} />

        <div className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full flex flex-col justify-center animate-fade-in">
          {/* Main Card */}
          <div className="bg-[#181818] border border-[#2d2d2d] rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col">

            {/* Subscription Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div className="flex-1 flex flex-col">
                <span className="text-[#8a8a8a] text-xs uppercase tracking-widest font-sans mb-3 block">
                  Your Subscription
                </span>

                <div className="flex items-center flex-wrap gap-3">
                  <h2 className="text-5xl font-sans font-light tracking-tight text-white leading-none">
                    {config.displayName}
                  </h2>

                  {config.buttonLabel && (
                    <button
                      onClick={() => navigate('/plans')}
                      className="bg-white text-black hover:bg-gray-200 px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                    >
                      {config.buttonLabel}
                    </button>
                  )}
                </div>

                {config.hasDuration && (
                  <span className="text-gray-500 text-sm mt-3 block font-sans">
                    Time: {planDuration}
                  </span>
                )}

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-0 gap-y-3 mt-6 text-[#9a9a9a] text-sm font-sans max-w-[280px]">
                  {config.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#888] shrink-0">
                        <path d="M2 12l5 5L15 7" />
                        <path d="M8 12l5 5L21 7" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {config.image && (
                <div className="flex-shrink-0 self-center md:self-end mt-6 mr-16 md:mt-0 md:-mb-10 max-w-[280px]">
                  <img
                    src={config.image}
                    alt={config.displayName}
                    className="w-full h-auto object-contain max-h-[160px] md:max-h-[180px] select-none pointer-events-none"
                  />
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-[#2d2d2d] my-10" />

          {/* Information Section */}
          <div>
            <h3 className="text-lg font-medium text-white mb-8 font-sans">
              Information
            </h3>

            {message && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-sans ${
                message.type === 'success' ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-300' : 'bg-rose-950/50 border border-rose-800 text-rose-300'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

                {/* Column 1 */}
                <div className="space-y-6">
                  <div>
                    <label className="text-[#8a8a8a] text-xs uppercase tracking-wider mb-2.5 block font-sans">
                      Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Your Name"
                      className="w-full bg-[#242424] border border-[#333] focus:border-[#555] rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all font-sans text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[#8a8a8a] text-xs uppercase tracking-wider mb-2.5 block font-sans">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full bg-[#1e1e1e] border border-[#2a2a2a] text-gray-500 rounded-xl px-4 py-3 cursor-not-allowed outline-none font-sans text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[#8a8a8a] text-xs uppercase tracking-wider mb-2.5 block font-sans">
                      Country
                    </label>
                    <div className="relative">
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-[#242424] border border-[#333] focus:border-[#555] rounded-xl px-4 py-3 text-white outline-none transition-all font-sans text-sm appearance-none cursor-pointer"
                      >
                        <option value="Vietnam">Vietnam</option>
                        <option value="United States">United States</option>
                        <option value="Singapore">Singapore</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Japan">Japan</option>
                        <option value="Canada">Canada</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="South Korea">South Korea</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                  <div>
                    <label className="text-[#8a8a8a] text-xs uppercase tracking-wider mb-2.5 block font-sans">
                      Company
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Company name"
                      className="w-full bg-[#242424] border border-[#333] focus:border-[#555] rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all font-sans text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[#8a8a8a] text-xs uppercase tracking-wider mb-2.5 block font-sans">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Job title"
                      className="w-full bg-[#242424] border border-[#333] focus:border-[#555] rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all font-sans text-sm"
                    />
                  </div>
                </div>

              </div>

              {/* Save Button */}
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 px-8 py-2.5 rounded-full font-semibold text-sm transition-all active:scale-95 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  </div>
  );
}
