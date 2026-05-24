import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Landing() {
  const navigate = useNavigate();

  const handleAuthRedirect = (path: string) => {
    const isProd = import.meta.env.PROD;
    if (isProd) {
      window.location.href = `https://dashboard.vifcpass.com${path}`;
    } else {
      navigate(path);
    }
  };

  const [activeSection, setActiveSection] = useState('introduce');
  const [activeTab, setActiveTab] = useState(2); // Default to VIFC Policy Access (index 2)
  const [hoveredStep, setHoveredStep] = useState(0); // Default to Step 1 active
  const [activeFaq, setActiveFaq] = useState<number | null>(0); // Default first FAQ open

  // Scroll spy to detect active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['introduce', 'benefits-intro', 'steps', 'benefits', 'subscription', 'faq'];
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          const height = rect.height;
          if (scrollPosition >= top && scrollPosition < top + height) {
            if (sectionId === 'benefits-intro' || sectionId === 'steps') {
              setActiveSection('benefits');
            } else {
              setActiveSection(sectionId);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    const targetId = id === 'benefits' ? 'benefits-intro' : id;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { label: 'Introduce', id: 'introduce' },
    { label: 'Benefits', id: 'benefits' },
    { label: 'Subscription', id: 'subscription' },
    { label: 'FAQ', id: 'faq' },
  ];

  const benefitsTabs = [
    {
      title: 'Privileged Information Access',
      description: 'Access exclusive market insights, structured databases, and official VIFC reports.',
      iconType: 'info'
    },
    {
      title: 'GOE Ecosystem Benefits',
      description: 'Connect with key industry leaders, attend private forums, and explore joint investment options.',
      iconType: 'ecosystem'
    },
    {
      title: 'VIFC Policy Access',
      description: 'Policy-enabled benefits, official updates, and strategic partnerships.',
      iconType: 'policy'
    }
  ];

  const handleTabPrev = () => {
    setActiveTab(prev => (prev === 0 ? benefitsTabs.length - 1 : prev - 1));
  };

  const handleTabNext = () => {
    setActiveTab(prev => (prev === benefitsTabs.length - 1 ? 0 : prev + 1));
  };

  const steps = [
    {
      step: 'Step 01',
      title: 'Seamless Signup',
      description: 'Create your account and submit your application'
    },
    {
      step: 'Step 02',
      title: 'Instant Pass Activation',
      description: 'Complete payment and activate your pass instantly.'
    },
    {
      step: 'Step 03',
      title: 'Unlock Exclusive Benefits',
      description: 'Explore premium insights and investment opportunities.'
    }
  ];

  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      time: 'Time: 1 year',
      features: ['Dashboard', 'Newsletter', 'Light report', 'Webinar'],
      isActive: false,
      buttonText: 'Explore Membership'
    },
    {
      id: 'base',
      name: 'Base',
      price: '$1',
      time: 'Time: 1 year',
      features: ['Dashboard', 'Newsletter', 'Light report', 'Webinar'],
      isActive: false,
      buttonText: 'Explore Membership'
    },
    {
      id: 'standard',
      name: 'Standard',
      price: '$500',
      time: 'Time: 1 year',
      features: ['Dashboard', 'Newsletter', 'Webinar', 'Full report', 'Exclusive Event'],
      isActive: true,
      buttonText: 'Explore Membership',
      isPopular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$2500',
      time: '',
      features: ['Waiting list'],
      isActive: false,
      buttonText: 'Explore Membership',
      isWaiting: true
    }
  ];

  const faqs = [
    {
      question: 'What is VIFC Privilege Pass?',
      answer: 'VIFC Privilege Pass is a premium investor membership powered by GOE Alliance.'
    },
    {
      question: 'Why is VIFC Privilege Pass important for investors?',
      answer: 'It grants fast-tracked access to legal structures, direct coordination with VIFC officials, and exclusive networking circles.'
    },
    {
      question: 'Who is eligible to join?',
      answer: 'Qualified institutional investors, venture capitalists, and accredited individual investors interested in the Vietnam investment landscape.'
    },
    {
      question: 'How do I get started?',
      answer: 'Simply create your account, submit your verification documents, activate your pass subscription, and unlock the dashboard.'
    }
  ];

  const renderBenefitSVG = (type: string) => {
    return (
      <svg width="220" height="220" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_0_25px_rgba(147,51,234,0.4)]">
        <defs>
          <linearGradient id="glowingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8125c" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="glowPulse" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="88" stroke="url(#glowPulse)" strokeWidth="4" strokeDasharray="10 5" />
        <circle cx="100" cy="100" r="80" stroke="url(#glowingGrad)" strokeWidth="2.5" />

        {type === 'info' && (
          <>
            <path d="M60 70C60 58.9543 77.9086 50 100 50C122.091 50 140 58.9543 140 70M60 70V95C60 106.046 77.9086 115 100 115C122.091 115 140 106.046 140 95V70M60 70C60 81.0457 77.9086 90 100 90C122.091 90 140 81.0457 140 70" stroke="url(#glowingGrad)" strokeWidth="3" strokeLinecap="round" />
            <path d="M60 95V120C60 131.046 77.9086 140 100 140C122.091 140 140 131.046 140 120V95" stroke="url(#glowingGrad)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="70" r="3" fill="#ffffff" />
            <circle cx="100" cy="95" r="3" fill="#ffffff" />
            <circle cx="100" cy="120" r="3" fill="#ffffff" />
            <path d="M115 110L145 140M135 115C143.284 115 150 108.284 150 100C150 91.7157 143.284 85 135 85C126.716 85 120 91.7157 120 100C120 108.284 126.716 115 135 115Z" stroke="#ffffff" strokeWidth="2.5" />
          </>
        )}

        {type === 'ecosystem' && (
          <>
            <circle cx="100" cy="100" r="45" stroke="url(#glowingGrad)" strokeWidth="3" />
            <path d="M100 55C100 55 115 75 115 100C115 125 100 145 100 145" stroke="url(#glowingGrad)" strokeWidth="2" />
            <path d="M100 55C100 55 85 75 85 100C85 125 100 145 100 145" stroke="url(#glowingGrad)" strokeWidth="2" />
            <line x1="55" y1="100" x2="145" y2="100" stroke="url(#glowingGrad)" strokeWidth="2.5" />

            <circle cx="100" cy="55" r="5" fill="#ffffff" />
            <circle cx="100" cy="145" r="5" fill="#ffffff" />
            <circle cx="55" cy="100" r="5" fill="#ffffff" />
            <circle cx="145" cy="100" r="5" fill="#ffffff" />
            <circle cx="100" cy="100" r="6" fill="#ffffff" />

            <path d="M68 68L132 132M132 68L68 132" stroke="url(#glowingGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
          </>
        )}

        {type === 'policy' && (
          <>
            <path d="M60 70L100 50L140 70H60Z" stroke="url(#glowingGrad)" strokeWidth="3" strokeLinejoin="round" />
            <line x1="72" y1="72" x2="72" y2="105" stroke="url(#glowingGrad)" strokeWidth="3.5" />
            <line x1="100" y1="72" x2="100" y2="105" stroke="url(#glowingGrad)" strokeWidth="3.5" />
            <line x1="128" y1="72" x2="128" y2="105" stroke="url(#glowingGrad)" strokeWidth="3.5" />
            <path d="M55 105H145V112H55V105Z" fill="url(#glowingGrad)" />

            <rect x="95" y="90" width="48" height="58" rx="4" fill="#070708" stroke="url(#glowingGrad)" strokeWidth="2" />
            <line x1="103" y1="102" x2="135" y2="102" stroke="#ffffff" strokeWidth="2" />
            <line x1="103" y1="112" x2="135" y2="112" stroke="#ffffff" strokeWidth="2" />
            <line x1="103" y1="122" x2="125" y2="122" stroke="#ffffff" strokeWidth="2" />

            <path d="M110 120C110 120 119 122 119 126C119 133 115 138 110 140C105 138 101 133 101 126C101 122 110 120 110 120Z" fill="#e8125c" stroke="#ffffff" strokeWidth="1.5" />
            <path d="M106 129L109 132L114 126" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[#070708] text-white font-poppins selection:bg-white selection:text-black overflow-x-hidden w-full">
      {/* Dynamic Background SVG Filter definitions (Shared) */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="violet-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="40" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 md:px-12 flex items-center justify-between pointer-events-none">
        {/* Logo */}
        <div
          className="text-2xl font-bold tracking-tight text-white select-none cursor-pointer pointer-events-auto"
          onClick={() => handleNavClick('introduce')}
        >
          VIFC
        </div>

        {/* Center Pill Nav Links */}
        <div className="hidden md:flex items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-2 py-1.5 pointer-events-auto shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] absolute left-1/2 transform -translate-x-1/2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-5 py-1.5 rounded-full text-[14px] font-medium transition-all duration-300 cursor-pointer ${
                activeSection === item.id
                  ? 'text-white bg-white/10 font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right CTA Button */}
        <div className="pointer-events-auto">
          <button
            onClick={() => handleAuthRedirect('/login')}
            className="bg-white hover:bg-white/90 text-black font-semibold text-[14px] px-6 py-2.5 rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Explore VIFC Pass
          </button>
        </div>
      </nav>

      {/* 1. Introduce (Hero Section) */}
      <section
        id="introduce"
        className="min-h-screen flex flex-col justify-between items-center relative overflow-hidden bg-[#070708]"
        style={{
          backgroundImage: "url('/landingbg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-start w-full px-6 max-w-7xl mx-auto pt-24">
          <div className="relative select-none my-10 pt-6 flex flex-col items-center w-full">
            <h1 className="font-playfair text-5xl sm:text-7xl md:text-8xl lg:text-[110px] text-white font-normal italic tracking-tight leading-none text-center">
              The Gateway
            </h1>

            <div className="flex items-center justify-center relative mt-4 md:mt-6 w-full max-w-[1200px]">
              <span className="font-playfair text-5xl sm:text-7xl md:text-8xl lg:text-[110px] text-white font-normal italic tracking-tight leading-none">
                to
              </span>

              <div className="w-[100px] sm:w-[140px] md:w-[180px] lg:w-[220px] h-4 relative">
                {/* Tilted Pass Card Overlay */}
                <div className="absolute right-[-20px] sm:right-[-30px] md:right-[-40px] lg:right-[-85px] top-[-10px] sm:top-[-20px] md:top-[-40px] lg:top-[40px] -rotate-[11.5deg] w-[180px] sm:w-[260px] md:w-[360px] lg:w-[400px] filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.8)] z-10 transition-transform duration-500 hover:rotate-[-8deg] hover:scale-[1.03]">
                  <img
                    src="/vifc_pass_home.png"
                    alt="VIFC Privilege Pass Card"
                    className="w-full h-auto select-none pointer-events-none"
                  />
                </div>
              </div>

              <span className="font-playfair text-5xl sm:text-7xl md:text-8xl lg:text-[110px] text-white font-normal italic tracking-tight leading-none">
                VIFC
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-6 flex-1 mt-50 z-20">
            <button
              onClick={() => handleAuthRedirect('/login')}
              className="bg-white hover:bg-white/90 text-black font-semibold px-8 py-3.5 rounded-full text-[15px] transition-all cursor-pointer shadow-lg active:scale-[0.97]"
            >
              Explore VIFC Pass
            </button>
            {/* 
            <button
              onClick={() => handleAuthRedirect('/register')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-semibold px-8 py-3.5 rounded-full text-[15px] transition-all cursor-pointer shadow-lg backdrop-blur-sm active:scale-[0.97]"
            >
              Launch your Pass
            </button>
            */}
          </div>
        </div>

        <div className="relative z-10 py-8 flex flex-col items-center gap-1.5 opacity-60 animate-bounce cursor-pointer" onClick={() => handleNavClick('benefits')}>
          <span className="text-xs uppercase font-semibold tracking-widest">Scroll to Explore</span>
          <span className="text-[10px]">▼</span>
        </div>
      </section>

      {/* 2. Benefits Intro Section - Swapped to 1st Benefits sub-section, Height reduced to 660px */}
      <section
        id="benefits-intro"
        className="h-[550px] flex items-center justify-center bg-[#070708] relative overflow-hidden w-full"
      >
        <div className="absolute right-[-10%] top-[10%] w-[400px] h-[400px] rounded-full bg-indigo-900/5 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto px-6 md:px-16 flex items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
            {/* Flat Pass Card on Left */}
            <div className="flex justify-center lg:justify-start">
              <div className="w-full max-w-[440px] rounded-[32px] overflow-hidden filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.65)] hover:scale-[1.01] transition-transform duration-300">
                <img
                  src="/vifc_pass_home.png"
                  alt="VIFC Privilege Pass Card Flat"
                  className="w-full h-auto select-none pointer-events-none"
                />
              </div>
            </div>

            {/* Playfair Serif Text on Right */}
            <div className="text-center lg:text-left">
              <p className="font-playfair text-2xl sm:text-3xl md:text-[34px] leading-[1.35] text-white font-normal italic tracking-tight">
                An exclusive pass for qualified investors, providing access to premium insight reports, curated investment opportunities, and strategic relationships within the VIFC ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Onboarding Steps ("Start using VIFC Pass") - Swapped to 2nd section */}
      <section
        id="steps"
        className="h-[994px] bg-[#070708] flex flex-col items-center justify-center px-6 md:px-16 max-w-7xl mx-auto py-10 relative w-full"
      >
        <div className="absolute left-[-15%] top-[10%] w-[500px] h-[500px] rounded-full bg-purple-950/10 blur-[120px] pointer-events-none" />

        {/* Section Title */}
        <div className="text-center mb-10">
          <h2 className="font-playfair text-4xl md:text-5xl font-medium tracking-tight text-white italic">
            Start using VIFC Pass
          </h2>
        </div>

        {/* Center horizontal Card preview */}
        <div className="flex justify-center mb-16">
          <div className="w-full max-w-[420px] rounded-3xl overflow-hidden filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.65)] hover:scale-[1.02] transition-transform duration-300">
            <img
              src="/vifc_pass_home.png"
              alt="VIFC Privilege Pass horizontal Card"
              className="w-full h-auto select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Steps progressive row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch">
          {steps.map((step, idx) => {
            const isHovered = hoveredStep === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredStep(idx)}
                className={`p-6 rounded-[24px] flex flex-col gap-4 border transition-all duration-300 ${
                  isHovered
                    ? 'bg-[#18181b]/60 border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.4)] translate-y-[-4px]'
                    : 'bg-transparent border-transparent opacity-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-3 py-1 rounded-full border border-white/5 bg-white/5">
                    {step.step}
                  </span>
                </div>

                <div>
                  <h3 className="font-playfair text-lg font-medium text-white italic">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Benefits Slider Section - Swapped to last section of Benefits */}
      <section
        id="benefits"
        className="h-[600px] bg-[#070708] flex flex-col items-center justify-start px-6 md:px-16 max-w-7xl mx-auto py-10 relative w-full overflow-hidden"
      >
        <div className="absolute right-[-10%] top-[30%] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

        {/* Section Title */}
        <div className="text-center mb-10">
          <h2 className="font-playfair text-4xl md:text-5xl font-medium tracking-tight text-white italic">
            Benefits
          </h2>
        </div>

        {/* Tab Slider content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          {/* Left Column: Interactive tabs list */}
          <div className="lg:col-span-5 flex flex-col gap-5 w-full">
            {benefitsTabs.map((tab, idx) => {
              const isActive = idx === activeTab;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`transition-all duration-300 rounded-[20px] cursor-pointer ${
                    isActive
                      ? 'bg-[#121215]/80 border border-white/5 p-6 shadow-[0_15px_35px_rgba(0,0,0,0.4)] translate-x-2'
                      : 'p-4 hover:translate-x-1 opacity-50 hover:opacity-85'
                  }`}
                >
                  <h3 className={`text-lg md:text-xl font-semibold leading-snug ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {tab.title}
                  </h3>
                  {isActive && (
                    <p className="text-gray-400 text-sm mt-3 leading-relaxed transition-all duration-300">
                      {tab.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: High-fidelity SVG Icon visual */}
          <div className="lg:col-span-7 flex justify-center items-center relative py-10 min-h-[300px]">
            {benefitsTabs.map((tab, idx) => {
              const isActive = idx === activeTab;
              if (!isActive) return null;
              return (
                <div
                  key={idx}
                  className="animate-in fade-in zoom-in-95 duration-500 flex justify-center items-center"
                >
                  {renderBenefitSVG(tab.iconType)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Arrows at bottom */}
        <div className="flex items-center gap-6 mt-10 justify-center">
          <button
            onClick={handleTabPrev}
            className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white text-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            ←
          </button>
          <button
            onClick={handleTabNext}
            className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white text-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            →
          </button>
        </div>
      </section>

      {/* 5. Subscription Section */}
      <section
        id="subscription"
        className="min-h-screen bg-[#070708] flex flex-col items-center justify-center px-6 md:px-16 py-10 relative w-full"
      >
        <div className="absolute right-[-10%] top-[40%] w-[500px] h-[500px] rounded-full bg-blue-950/10 blur-[130px] pointer-events-none" />

        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-medium tracking-tight text-white italic">
            Subscription
          </h2>
        </div>

        {/* Plans Grid (Fully synced with SubscriptionPlans.tsx card styling) */}
        <div className="grid grid-cols-1 mt-10 md:grid-cols-2 lg:grid-cols-4 gap-[29px] w-full max-w-7xl mx-auto items-center justify-items-center">
          {subscriptionPlans.map((plan, idx) => {
            const isPopular = plan.isPopular;
            return (
              <div key={idx} className={`relative flex flex-col items-center ${isPopular ? 'h-[440px]' : 'h-[360px]'}`}>

                {/* Card Body */}
                <div className={`relative p-6 rounded-[2.5rem] backdrop-blur-md border transition-all duration-300 flex flex-col overflow-hidden w-[327px] max-w-full h-full hover:bg-[#5a5a5a]/85 hover:border-white/30 hover:shadow-2xl text-white
                  ${isPopular
                    ? 'bg-[#404040]/80 border-white/20 shadow-xl'
                    : 'bg-[#151515]/80 border-white/5'
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

                    {/* Card Title */}
                    <div className="flex items-center gap-3 mb-1.5 mt-2">
                      <h3 className="text-3xl text-white font-normal tracking-wide">{plan.name}</h3>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline text-[2.75rem] font-bold text-white mb-2 tracking-tight">
                      <span>{plan.price}</span>
                    </div>

                    {/* Duration / Line */}
                    <div className="border-b border-white/10 pb-4 mb-4">
                      <p className="text-[#a1a1aa] text-[15px] font-medium h-6">
                        {plan.time}
                      </p>
                    </div>

                    {/* Features list */}
                    {plan.isWaiting ? (
                      <div className="flex items-center gap-2.5 text-[#d1d1d1] text-[15px] mt-4">
                        <span>☞</span>
                        <span>Waiting list</span>
                      </div>
                    ) : (
                      <ul className="flex flex-col gap-3">
                        {plan.features.map((feature, fidx) => (
                          <li key={fidx} className="flex items-center gap-2.5 text-[#d1d1d1] text-[15px]">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
                              <path d="M2 12l5 5L15 7" />
                              <path d="M8 12l5 5L21 7" />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. FAQ Accordions + Footer */}
      <div className="relative w-full overflow-hidden bg-[#070708]">

        <section
          id="faq"
          className="h-[613px] relative flex flex-col justify-center items-center w-full"
        >


          {/* FAQ Center container */}
          <div className="relative z-20 flex flex-col items-center justify-center px-6 md:px-16 max-w-4xl mx-auto w-full pt-16">
            <div className="flex flex-col gap-4 w-full">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-[20px] border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? 'bg-[#18181b]/70 border-white/10 shadow-lg'
                        : 'bg-[#121214]/40 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-[15px] md:text-[16px] text-white cursor-pointer select-none"
                    >
                      <span className="font-playfair italic font-medium">{faq.question}</span>
                      <span className="text-xs transition-transform duration-300">
                        {isOpen ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        )}
                      </span>
                    </button>

                    <div
                      className={`transition-all duration-500 ease-in-out ${
                        isOpen ? 'max-h-[150px] border-t border-white/5 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                      }`}
                    >
                      <p className="px-6 py-5 text-xs md:text-sm text-gray-400 leading-relaxed font-normal">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Footer info */}
        <footer
          className="relative z-20 w-full border-t border-white/10 py-12 px-6 md:px-16"
          style={{
            backgroundColor: 'transparent',
          }}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full text-sm">
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Contact
              </h4>
              <p className="text-white text-[15px] font-medium leading-relaxed">
                (+84) 964 93 1661
              </p>
              <p className="text-white text-[15px] font-medium leading-relaxed">
                partner@goealliance.org
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Address
              </h4>
              <p className="text-white text-[15px] font-medium leading-relaxed">
                GOE Alliance Office
              </p>
              <p className="text-white text-[15px] font-medium leading-relaxed">
                IFC Building, 8 Nguyen Huy Street, Saigon Ward, Ho Chi Minh City
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
