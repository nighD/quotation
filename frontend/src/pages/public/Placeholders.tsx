import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { ArticleCard } from '../../components/ArticleCard';
import { useAuth } from '../../context/AuthContext';

export function Home() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'free' | 'basic' | 'pro' | 'premium'>('free');
  const [openStates, setOpenStates] = useState<boolean[]>([false, false, false]);
  const [toastMessage, setToastMessage] = useState<{title: string, type: 'success' | 'error'} | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const toggleCollapse = (index: number) => {
    setOpenStates(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

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
    if (user && user.roles && user.roles.includes('premium')) {
      setUserRole('premium');
    } else {
      setUserRole('free');
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#111] bg-cover bg-center bg-no-repeat flex flex-col font-poppins relative" style={{ backgroundImage: "url('/bg.png')" }}>
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      <Navbar />

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
          <button onClick={() => setToastMessage(null)} className="ml-4 text-[#a1a1aa] hover:text-white transition text-xl cursor-pointer">&times;</button>
        </div>
      )}

      <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-12 md:px-12 max-w-[1400px] mx-auto w-full pt-0">
        {/* Top Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start w-full mt-6 relative lg:h-[450px]">
          {/* Left Column: Title + Subtitle + Tilted Card */}
          <div className="flex flex-col">
            <h1 className="text-5xl md:text-7xl font-semibold mb-4 text-white tracking-tight leading-[1.1]">
              VIFC Privilege Pass
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-xl mb-8">
              A platform that curates and structures official information, enabling investors to access strategic opportunities across VIFC and Vietnam.
            </p>

            {/* Tilted Card Image */}
            <div className="relative pl-0 lg:pl-10 flex justify-center lg:justify-start z-10 lg:absolute lg:left-[370px] lg:top-[130px] lg:bottom-auto">
              <img
                src="/vifc_pass_home.png"
                alt="VIFC Privilege Pass Card"
                className="w-[500px] max-w-full h-auto transform -rotate-[11.1deg] filter drop-shadow-[0_25px_60px_rgba(0,0,0,0.7)] select-none pointer-events-none"
              />
            </div>
          </div>

          {/* Right Column: VIFC Pass Benefit Card (Overlapping, positioned above z-index) */}
          <div className="flex justify-end lg:justify-end lg:-ml-32 relative z-20 lg:mt-0">
            <div className="bg-white/20 backdrop-blur-md border border-white/10 rounded-[32px] p-8 md:p-10 text-white w-full max-w-[440px] shadow-2xl flex flex-col gap-6">
              <div>
                <h2 className="text-[26px] font-semibold mb-2">VIFC Pass Benefit</h2>
                <p className="text-gray-200 text-[15px] leading-relaxed">
                  Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including:
                </p>
              </div>

              <ul className="flex flex-col gap-4 text-[15px] text-gray-100 font-medium">
                <li
                  className="cursor-pointer group flex flex-col gap-1.5 select-none"
                  onClick={() => toggleCollapse(0)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] text-white transition-transform duration-200 ${openStates[0] ? 'rotate-90' : ''}`}>▶</span>
                    <span className="group-hover:text-white transition-colors">Privileged info</span>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${openStates[0] ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-gray-300 text-[14px] font-normal pl-[22px] leading-relaxed">
                      Premium reports and exclusive investor events.
                    </p>
                  </div>
                </li>
                <li
                  className="cursor-pointer group flex flex-col gap-1.5 select-none"
                  onClick={() => toggleCollapse(1)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] text-white transition-transform duration-200 ${openStates[1] ? 'rotate-90' : ''}`}>▶</span>
                    <span className="group-hover:text-white transition-colors">Policy access</span>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${openStates[1] ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-gray-300 text-[14px] font-normal pl-[22px] leading-relaxed">
                      official updates and policy-enabled benefits
                    </p>
                  </div>
                </li>
                <li
                  className="cursor-pointer group flex flex-col gap-1.5 select-none"
                  onClick={() => toggleCollapse(2)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] text-white transition-transform duration-200 ${openStates[2] ? 'rotate-90' : ''}`}>▶</span>
                    <span className="group-hover:text-white transition-colors">Strategic connections</span>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${openStates[2] ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-gray-300 text-[14px] font-normal pl-[22px] leading-relaxed">
                      curated opportunities and ecosystem partnerships
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section: Three Cards */}
        <div className="w-full mt-16">
          <div className="flex justify-end items-end mb-8">
            <button
              type="button"
              className="bg-[#6b6b6b]/60 hover:bg-[#808080]/60 transition-all text-white rounded-full px-6 py-2.5 flex items-center gap-1.5 text-[14px] font-medium cursor-pointer border border-white/5 shadow-md"
            >
              <span>Read more</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-end">
            <ArticleCard
              title="Article Name 01"
              date="Sun 17 May 15:29"
              abstract="Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including."
              requiredRole="free"
              userRole={userRole}
              onExpand={() => navigate('/reports/detail/1')}
              className="h-fit min-h-[220px]"
            />
            <ArticleCard
              title="Article Name 02"
              date="Sun 17 May 15:29"
              abstract="Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments..."
              requiredRole="premium"
              userRole={userRole}
              onExpand={() => navigate('/reports/detail/2')}
              className="h-fit min-h-[250px]"
            />
            <ArticleCard
              title="Article Name 03"
              date="Sun 17 May 15:29"
              abstract="Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including."
              requiredRole="free"
              userRole={userRole}
              onExpand={() => navigate('/reports/detail/3')}
              className="h-fit min-h-[220px]"
            />

          </div>
        </div>
      </div>
    </div>
  );
}

export function Reports() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'free' | 'basic' | 'pro' | 'premium'>('free');
  const [activeTag, setActiveTag] = useState('Article Tag');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.roles && user.roles.includes('premium')) {
      setUserRole('premium');
    } else {
      setUserRole('free');
    }
  }, [user]);

  const handleExpand = (id: string) => {
    navigate(`/reports/detail/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#111] bg-cover bg-center bg-no-repeat flex flex-col font-poppins relative" style={{ backgroundImage: "url('/bg.png')" }}>
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      <Navbar />
      
      <div className="relative z-10 flex-1 flex flex-col px-6 md:px-12 max-w-[1400px] mx-auto w-full pt-4">
        {/* Title + Search Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full mb-6">
          <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight">Reports</h1>
          
          <div className="relative w-full md:max-w-[280px]">
            <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-[#2d2a2a]/40 border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-white text-[14px] placeholder-gray-400 focus:outline-none focus:border-white/20 transition-all"
            />
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-3 mb-8 w-full">
          {['Article Tag', 'hastag', 'tag demo', 'report tag demo'].map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-5 py-2 rounded-full text-[14px] font-medium transition-all cursor-pointer ${
                activeTag === tag
                  ? 'bg-white text-black font-semibold'
                  : 'bg-[#2d2a2a]/40 border border-white/5 text-gray-300 hover:text-white hover:bg-[#3d3a3a]/40'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* 3-Column Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start">
          {/* Column 1 */}
          <div className="flex flex-col gap-6 w-full">
            <ArticleCard
              title="Article Name 02"
              date="Sun 17 May 15:29"
              abstract="Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including..."
              requiredRole="premium"
              userRole={userRole}
              variant="report"
              onExpand={() => handleExpand("2")}
              className="w-full"
            />
            <ArticleCard
              title="Article Name 03"
              date="Sun 17 May 15:29"
              abstract="Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including..."
              requiredRole="free"
              userRole={userRole}
              variant="report"
              imageUrl="/glowing_chip.png"
              onExpand={() => handleExpand("3")}
              className="w-full"
            />
            <ArticleCard
              title="Article Name 02"
              date="Sun 17 May 15:29"
              abstract="Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including..."
              requiredRole="premium"
              userRole={userRole}
              variant="report"
              imageUrl="/bitcoin_icon.png"
              onExpand={() => handleExpand("4")}
              className="w-full"
            />
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-6 w-full">
            <ArticleCard
              title="Article Name 03"
              date="Sun 17 May 15:29"
              abstract="Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including..."
              requiredRole="free"
              userRole={userRole}
              variant="report"
              imageUrl="/keyboard_bitcoin.png"
              onExpand={() => handleExpand("5")}
              className="w-full"
            />
            <ArticleCard
              title="Article Name 02"
              date="Sun 17 May 15:29"
              abstract="Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including..."
              requiredRole="premium"
              userRole={userRole}
              variant="report"
              imageUrl="/bitcoin_basket.png"
              onExpand={() => handleExpand("6")}
              className="w-full"
            />
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-6 w-full">
            <ArticleCard
              title="Article Name 03"
              date="Sun 17 May 15:29"
              abstract="Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including..."
              requiredRole="free"
              userRole={userRole}
              variant="report"
              imageUrl="/blue_card.png"
              onExpand={() => handleExpand("7")}
              className="w-full"
            />
            <ArticleCard
              title="Article Name 02"
              date="Sun 17 May 15:29"
              abstract="Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including..."
              requiredRole="premium"
              userRole={userRole}
              variant="report"
              onExpand={() => handleExpand("8")}
              className="w-full"
            />
            <ArticleCard
              title="Article Name 03"
              date="Sun 17 May 15:29"
              abstract="Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including..."
              requiredRole="free"
              userRole={userRole}
              variant="report"
              imageUrl="/crypto_blocks.png"
              onExpand={() => handleExpand("9")}
              className="w-full"
            />
          </div>
        </div>

        {/* Read More Centered Button */}
        <div className="flex justify-center items-center mt-12 mb-16 w-full">
          <button
            type="button"
            className="bg-[#2d2a2a]/60 hover:bg-[#3d3a3a]/80 transition-all text-white rounded-full px-8 py-3 flex items-center gap-1.5 text-[15px] font-medium cursor-pointer border border-white/5 shadow-md"
          >
            <span>Read more</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function Deals() {
  return (
    <div className="min-h-screen bg-[#111] bg-cover bg-center bg-no-repeat flex flex-col font-poppins relative" style={{ backgroundImage: "url('/bg.png')" }}>
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      <Navbar />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-6xl font-semibold mb-6 text-white tracking-tight">Active Deals</h1>
        <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
          Browse negotiated deals, VIP concierge packages, and global travel benefits.
        </p>
      </div>
    </div>
  );
}

export function Benefits() {
  return (
    <div className="min-h-screen bg-[#111] bg-cover bg-center bg-no-repeat flex flex-col font-poppins relative" style={{ backgroundImage: "url('/bg.png')" }}>
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      <Navbar />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-6xl font-semibold mb-6 text-white tracking-tight">Privileges & Benefits</h1>
        <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
          Unlock premium concierge status, worldwide upgrades, and curated lifestyle rewards.
        </p>
      </div>
    </div>
  );
}

export function Events() {
  return (
    <div className="min-h-screen bg-[#111] bg-cover bg-center bg-no-repeat flex flex-col font-poppins relative" style={{ backgroundImage: "url('/bg.png')" }}>
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      <Navbar />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-6xl font-semibold mb-6 text-white tracking-tight">Exclusive Events</h1>
        <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
          Secure reservations for upcoming members-only galleries, private tastings, and borderless meetups.
        </p>
      </div>
    </div>
  );
}
