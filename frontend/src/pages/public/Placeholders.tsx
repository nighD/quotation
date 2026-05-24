import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { ArticleCard } from '../../components/ArticleCard';
import { useAuth } from '../../context/AuthContext';
import { MapPin } from 'lucide-react';

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

      <div className="relative z-10 flex-1 flex flex-col items-center justify-between px-6 md:px-12 max-w-[1400px] mx-auto w-full pt-0">
        {/* Top Hero Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-start w-full mt-4 lg:mt-6 relative lg:h-[450px]">
          {/* Left Column: Title + Subtitle */}
          <div className="flex flex-col w-full text-left">
            <h1 className="text-4xl md:text-7xl font-semibold mb-3 text-white tracking-tight leading-[1.1]">
              VIFC Pass
            </h1>
            <p className="text-gray-300 text-sm md:text-lg leading-relaxed max-w-xl mb-6">
              A card built natively for web3 business & individuals to address the complexity & accessibility of digital assets
            </p>

            {/* Overlapping Cards Container (Tilted Card + Benefit Card) on Mobile */}
            <div className="relative w-full h-[240px] sm:h-[300px] lg:hidden mb-6">
              {/* Tilted Card Image */}
              <div className="absolute left-[-20px] top-6 w-[70%] z-10">
                <img
                  src="/vifc_pass_home.png"
                  alt="VIFC Privilege Pass Card"
                  className="w-full h-auto transform -rotate-[11.1deg] filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] select-none pointer-events-none"
                />
              </div>
              
              {/* VIFC Pass Benefit Card (Scaled down on mobile) */}
              <div className="absolute right-0 top-0 w-[55%] z-20 bg-white/10 backdrop-blur-md border border-white/10 rounded-[20px] p-4 text-white shadow-xl flex flex-col gap-2.5">
                <div>
                  <h2 className="text-[12px] font-semibold mb-1">VIFC Pass Benefit</h2>
                  <p className="text-gray-200 text-[9px] leading-snug">
                    Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including:
                  </p>
                </div>

                <ul className="flex flex-col gap-1 text-[9px] text-gray-100 font-medium">
                  <li className="flex items-center gap-1.5">
                    <span className="text-[6px]">▶</span>
                    <span>Physical & Digital Charge Cards</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-[6px]">▶</span>
                    <span>Instant FIAT & Stablecoin Conversion</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-[6px]">▶</span>
                    <span>Transparent FX & Global Spending</span>
                  </li>
                </ul>

                <button 
                  onClick={() => navigate('/benefits')}
                  className="mt-1 self-start bg-white/15 hover:bg-white/25 transition text-white rounded-full px-3 py-1 text-[8px] font-medium flex items-center gap-1 border border-white/5 cursor-pointer"
                >
                  <span>Details</span>
                  <span>↗</span>
                </button>
              </div>
            </div>

            {/* Desktop-only Tilted Card Image placement */}
            <div className="hidden lg:block relative pl-10 z-10 lg:absolute lg:left-[370px] lg:top-[130px] lg:bottom-auto">
              <img
                src="/vifc_pass_home.png"
                alt="VIFC Privilege Pass Card"
                className="w-[500px] max-w-full h-auto transform -rotate-[11.1deg] filter drop-shadow-[0_25px_60px_rgba(0,0,0,0.7)] select-none pointer-events-none"
              />
            </div>
          </div>

          {/* Desktop-only Right Column: VIFC Pass Benefit Card */}
          <div className="hidden lg:flex justify-end lg:-ml-32 relative z-20">
            <div className="bg-white/20 backdrop-blur-md border border-white/10 rounded-[32px] p-8 md:p-10 text-white w-full max-w-[440px] shadow-2xl flex flex-col gap-6 text-left">
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
                    <span className="group-hover:text-white transition-colors">Physical & Digital Charge Cards</span>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${openStates[0] ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-gray-300 text-[14px] font-normal pl-[22px] leading-relaxed">
                      Enjoy borderless spending with credit limits and instant virtual/physical card issuance.
                    </p>
                  </div>
                </li>
                <li
                  className="cursor-pointer group flex flex-col gap-1.5 select-none"
                  onClick={() => toggleCollapse(1)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] text-white transition-transform duration-200 ${openStates[1] ? 'rotate-90' : ''}`}>▶</span>
                    <span className="group-hover:text-white transition-colors">Instant FIAT & Stablecoin Conversion</span>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${openStates[1] ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-gray-300 text-[14px] font-normal pl-[22px] leading-relaxed">
                      Convert and settle digital assets instantly with zero slippage and real-time liquidity.
                    </p>
                  </div>
                </li>
                <li
                  className="cursor-pointer group flex flex-col gap-1.5 select-none"
                  onClick={() => toggleCollapse(2)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] text-white transition-transform duration-200 ${openStates[2] ? 'rotate-90' : ''}`}>▶</span>
                    <span className="group-hover:text-white transition-colors">Transparent FX & Global Spending</span>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${openStates[2] ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-gray-300 text-[14px] font-normal pl-[22px] leading-relaxed">
                      Access highly competitive interbank FX rates for secure global payments.
                    </p>
                  </div>
                </li>
              </ul>
              
              <button 
                onClick={() => navigate('/benefits')}
                className="mt-2 self-start bg-white/20 hover:bg-white/30 transition text-white rounded-full px-6 py-2.5 text-[14px] font-medium flex items-center gap-1.5 border border-white/10 shadow-md cursor-pointer"
              >
                <span>Details</span>
                <span>↗</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Three Cards */}
        <div className="w-full mt-20">
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
              className="h-[300px]"
            />
            <div className="flex flex-col gap-[5px] items-end w-full h-fit">
              <button
                onClick={() => navigate('/reports')}
                type="button"
                className="bg-[#6b6b6b]/60 hover:bg-[#808080]/60 transition-all text-white rounded-full px-6 py-2.5 flex items-center gap-1.5 text-[14px] font-medium cursor-pointer border border-white/5 shadow-md"
              >
                <span>Read more</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </button>
              <ArticleCard
                title="Article Name 03"
                date="Sun 17 May 15:29"
                abstract="Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including."
                requiredRole="free"
                userRole={userRole}
                onExpand={() => navigate('/reports/detail/3')}
                className="w-full h-fit min-h-[220px]"
              />
            </div>
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
        <h1 className="text-6xl font-semibold mb-6 text-white tracking-tight">Deals</h1>
        <p className="text-gray-300 text-2xl font-medium tracking-wide">
          Coming Soon
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
  const mockEvents = [
    {
      id: 1,
      title: 'Event title demo here',
      date: 'Sun 17 May 15:29',
      status: 'active',
      statusLabel: '2 days left',
      imageUrl: '/crypto_blocks.png',
      description: 'Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless....',
      location: 'Location address here',
    },
    {
      id: 2,
      title: 'Event title demo here',
      date: 'Sun 17 May 15:29',
      status: 'active',
      statusLabel: '2 days left',
      imageUrl: '/crypto_blocks.png',
      description: 'Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless....',
      location: 'Location address here',
    },
    {
      id: 3,
      title: 'Event title demo here',
      date: 'Sun 17 May 15:29',
      status: 'active',
      statusLabel: '2 days left',
      imageUrl: '/crypto_blocks.png',
      description: 'Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless....',
      location: 'Location address here',
    },
    {
      id: 4,
      title: 'Event title demo here',
      date: 'Sun 17 May 15:29',
      status: 'expired',
      statusLabel: 'expired',
      imageUrl: '/crypto_blocks.png',
      description: 'Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless....',
      location: 'Location address here',
    },
    {
      id: 5,
      title: 'Event title demo here',
      date: 'Sun 17 May 15:29',
      status: 'expired',
      statusLabel: 'expired',
      imageUrl: '/crypto_blocks.png',
      description: 'Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless....',
      location: 'Location address here',
    },
  ];

  return (
    <div className="min-h-screen bg-[#111] bg-cover bg-center bg-no-repeat flex flex-col font-poppins relative" style={{ backgroundImage: "url('/bg.png')" }}>
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      <Navbar />

      <div className="relative z-10 flex-1 flex flex-col px-6 md:px-12 max-w-[1400px] mx-auto w-full pb-24 pt-4 animate-fade-in">
        {/* Title */}
        <div className="text-center mb-10 mt-6">
          <h1 className="text-4xl md:text-5xl font-medium text-white tracking-tight">Event</h1>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full items-start">
          {mockEvents.map((event) => {
            const isActive = event.status === 'active';
            return (
              <div
                key={event.id}
                className={`rounded-[28px] p-6 shadow-xl flex flex-col gap-4 border transition-all duration-300 hover:scale-[1.02] ${
                  isActive
                    ? 'bg-white border-gray-200 text-black'
                    : 'bg-[#2a2a2d]/80 border-white/5 text-white'
                }`}
              >
                {/* Header info */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col">
                    <h3 className={`text-[17px] font-semibold leading-tight ${isActive ? 'text-black' : 'text-white'}`}>
                      {event.title}
                    </h3>
                    <span className={`text-xs mt-1 ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                      {event.date}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'bg-white/10 text-gray-400 border border-white/5'
                  }`}>
                    {event.statusLabel}
                  </span>
                </div>

                <div className={`border-b ${isActive ? 'border-gray-200' : 'border-white/10'} my-1`} />

                {/* Event Image */}
                <div className="rounded-2xl overflow-hidden aspect-[16/10] bg-black/10 relative">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                </div>

                {/* Description */}
                <p className={`text-xs leading-relaxed line-clamp-3 ${isActive ? 'text-gray-600' : 'text-gray-300'}`}>
                  {event.description}
                </p>

                {/* Location */}
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className={`w-3.5 h-3.5 ${isActive ? 'text-[#4e4df9]' : 'text-gray-400'}`} />
                  <span className={`text-xs font-medium ${isActive ? 'text-[#4e4df9]' : 'text-gray-400'}`}>
                    {event.location}
                  </span>
                </div>

                {/* Register button */}
                <div className="mt-2">
                  {isActive ? (
                    <button className="w-full bg-white text-black hover:bg-gray-100 border border-gray-300 hover:border-gray-400 rounded-full py-2.5 text-xs font-semibold tracking-wide transition-all active:scale-[0.98] inline-flex items-center justify-center gap-1 cursor-pointer">
                      Register ↗
                    </button>
                  ) : (
                    <button disabled className="w-full bg-[#555]/30 text-gray-400 rounded-full py-2.5 text-xs font-semibold tracking-wide cursor-not-allowed inline-flex items-center justify-center gap-1">
                      Register ↗
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
