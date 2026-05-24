import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell } from 'lucide-react';

export function Navbar({ hideCenterNav = false }: { hideCenterNav?: boolean }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mobileNavItems = [
    { label: 'Home', path: '/home' },
    { label: 'Reports', path: '/reports' },
    { label: 'Deals', path: '/deals' },
    { label: 'Benefit', path: '/benefits' },
    { label: 'Subscription', path: '/subscriptions' },
  ];

  // Sliding active tab indicator states & ref
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const navContainerRef = useRef<HTMLDivElement>(null);

  const currentPath = location.pathname;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Slide animation active tab tracking
  useEffect(() => {
    const updateIndicator = () => {
      const container = navContainerRef.current;
      if (!container) return;

      // Locate active nav link
      const activeLink = container.querySelector('.active-nav-link') as HTMLElement;
      if (activeLink) {
        setIndicatorStyle({
          left: activeLink.offsetLeft,
          width: activeLink.offsetWidth,
          height: activeLink.offsetHeight,
          top: activeLink.offsetTop,
          opacity: 1,
        });
      } else {
        // Hide active capsule indicator if no active link matched (e.g. other routes)
        setIndicatorStyle({ opacity: 0 });
      }
    };

    updateIndicator();

    // Re-calculate after custom web fonts (Poppins) load completely to avoid offset positioning bugs
    if (document.fonts) {
      document.fonts.ready.then(updateIndicator);
    }

    // Re-calculate on window resize for responsiveness
    window.addEventListener('resize', updateIndicator);
    return () => {
      window.removeEventListener('resize', updateIndicator);
    };
  }, [currentPath, user]); // Include user to re-run when auth changes/loads

  const handleLogout = () => {
    logout();
    const isProd = import.meta.env.PROD;
    if (isProd) {
      window.location.href = 'https://vifcpass.com/';
    } else {
      navigate('/login');
    }
  };

  // Tabs when logged in
  const navItems = [
    { label: 'Home', path: '/home' },
    { label: 'Reports', path: '/reports' },
    { label: 'Deals', path: '/deals' },
    { label: 'Subscription', path: '/subscriptions' },
    { label: 'Event', path: '/events' },
  ];

  return (
    <header className="relative z-50 flex items-center justify-between md:justify-center px-6 md:px-12 py-6 max-w-[2000px] mx-auto w-full">
      {/* Mobile-only layout when logged in */}
      {user ? (
        <div className="flex md:hidden items-center justify-between w-full">
          {/* Hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="w-12 h-12 flex items-center justify-center bg-[#2d2a2a]/60 text-white rounded-full hover:bg-[#3d3a3a] transition-all duration-200 focus:outline-none cursor-pointer border border-white/5"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>

          {/* Bell button */}
          <button
            type="button"
            className="w-12 h-12 flex items-center justify-center bg-[#2d2a2a]/60 text-white rounded-full hover:bg-[#3d3a3a] transition-all duration-200 focus:outline-none cursor-pointer border border-white/5"
          >
            <Bell size={20} className="fill-white stroke-none" />
          </button>
        </div>
      ) : (
        // Mobile layout when not logged in
        <div className="flex md:hidden items-center justify-between w-full">
          <Link to="/" className="text-2xl font-bold tracking-widest text-white hover:text-gray-300 transition">
            VIFC
          </Link>
          <Link
            to="/login"
            className="bg-transparent text-white px-5 py-2 rounded-full font-medium text-[13px] border border-white/20 hover:bg-white/10 transition"
          >
            Login
          </Link>
        </div>
      )}

      {/* Desktop-only Logo */}
      <div className="hidden md:block absolute left-6 md:left-12">
        <Link to="/" className="text-2xl font-bold tracking-widest text-white hover:text-gray-300 transition">
          VIFC
        </Link>
      </div>

      {/* Floating Pill Navigation - Desktop only */}
      {!hideCenterNav && (
        <div className="hidden md:flex">
          {user ? (
            <div className="flex items-center bg-[#141414]/30 backdrop-blur-lg border border-white/10 rounded-[24px] p-1 shadow-xl">
              <div className="flex text-[14px] font-medium items-center font-poppins relative z-10" ref={navContainerRef}>
                {/* Sliding active indicator capsule */}
                <div
                  className="absolute bg-white rounded-[20px] transition-all duration-300 ease-out z-0"
                  style={indicatorStyle}
                />
                {navItems.map((item) => {
                  const isActive = currentPath === item.path || 
                                   (item.path === '/home' && currentPath === '/') ||
                                   (item.path === '/reports' && currentPath.startsWith('/reports/detail'));
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={`px-5 py-2.5 rounded-[20px] text-[14px] font-medium tracking-wide transition-colors duration-300 relative z-10 ${
                        isActive
                          ? 'active-nav-link text-black font-semibold'
                          : 'text-white hover:text-gray-200'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-8 bg-[#18181b]/80 backdrop-blur-md border border-white/10 rounded-full p-1.5 pl-8 shadow-xl">
              <div className="flex gap-8 text-[14px] text-[#d1d1d1] font-medium items-center">
                <a href="#" className="hover:text-white transition">How it works</a>
                <a href="#" className="hover:text-white transition">Pricing</a>
                <a href="#" className="hover:text-white transition">Memberships</a>
              </div>
              <div className="flex gap-2 ml-2">
                <button className="bg-white text-black px-6 py-2.5 rounded-full font-medium text-[14px] hover:bg-gray-200 transition cursor-pointer">
                  Explore Membership
                </button>
                <Link
                  to="/login"
                  className="bg-transparent text-white px-6 py-2.5 rounded-full font-medium text-[14px] border border-white/20 hover:bg-white/10 transition"
                >
                  Login
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Right Corner Buttons - Desktop only */}
      {user && (
        <div className="hidden md:flex absolute right-6 md:right-12 items-center gap-2">
          {/* Notification Button */}
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center bg-[#2d2a2a] text-white rounded-[14px] hover:bg-[#3d3a3a] transition-all duration-200 focus:outline-none cursor-pointer border border-white/5"
          >
            <Bell size={18} className="fill-white stroke-none" />
          </button>

          {/* Avatar Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-[14px] overflow-hidden focus:outline-none hover:opacity-90 transition-all duration-200 border border-white/10 bg-[#2d2a2a] flex items-center justify-center cursor-pointer"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-semibold">
                  {user.full_name.charAt(0).toUpperCase()}
                </span>
              )}
            </button>

            {/* Dropdown Popup */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white rounded-[24px] shadow-[0_12px_30px_rgba(0,0,0,0.25)] p-5 z-50 text-left border border-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex flex-col gap-3.5 font-poppins">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center justify-between text-[#1c1c1e] hover:opacity-75 transition-opacity font-medium text-[16px] tracking-normal"
                  >
                    <span>Profile</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1c1c1e]">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-between text-[#8E8E93] hover:text-[#555] transition-colors font-medium text-[16px] tracking-normal cursor-pointer w-full text-left"
                  >
                    <span>Log out</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8E8E93]">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#0c0c0e]/95 backdrop-blur-xl z-50 flex flex-col p-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between w-full mb-12">
            <span className="text-3xl font-semibold text-white tracking-widest font-poppins">VIFC</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="w-12 h-12 flex items-center justify-center bg-[#2d2a2a]/60 text-white rounded-full hover:bg-[#3d3a3a] transition-all duration-200 focus:outline-none cursor-pointer border border-white/5"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="9" x2="20" y2="9"></line>
                <line x1="4" y1="15" x2="20" y2="15"></line>
              </svg>
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col gap-6 text-left">
            {mobileNavItems.map((item) => {
              const isActive = currentPath === item.path || 
                               (item.path === '/home' && currentPath === '/') ||
                               (item.path === '/reports' && currentPath.startsWith('/reports/detail'));
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-4xl font-semibold tracking-normal transition-colors font-poppins ${
                    isActive ? 'text-white' : 'text-[#8E8E93]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <hr className="border-white/10 my-8" />

          {/* Profile Section */}
          <div className="flex items-center justify-between py-2">
            <Link 
              to="/profile" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-4xl font-semibold text-white tracking-normal font-poppins"
            >
              Profile
            </Link>
            
            {/* User Avatar */}
            <div className="w-14 h-14 rounded-[18px] overflow-hidden border border-white/10 bg-[#2d2a2a] flex items-center justify-center">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-lg font-semibold font-poppins">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <hr className="border-white/10 my-8" />

          {/* Logout Button */}
          <div className="mt-auto self-start">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="bg-[#2d2a2a]/60 hover:bg-[#3d3a3a] transition-all text-white rounded-full px-8 py-3.5 flex items-center gap-2.5 text-[16px] font-semibold cursor-pointer border border-white/5"
            >
              <span>Logout</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
