import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';

export function ReportPdf() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, setUser, loading: authLoading } = useAuth();
  const checkStarted = useRef(false);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (authLoading) return;
      if (checkStarted.current) return;
      checkStarted.current = true;

      // 1. Check if user is logged in
      if (!user) {
        navigate('/login');
        return;
      }

      // 2. Validate token and refresh it silently if expired
      let activeUser = user;
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // This call triggers the refresh interceptor if the token is expired!
          const { data } = await apiClient.get('/auth/profile');
          if (data && data.data) {
            activeUser = data.data;
            setUser(data.data);
          }
        } catch (error) {
          console.error("Token verification / refresh failed", error);
        }
      }

      // 3. Check roles - only premium and admin are allowed
      const isPremium = activeUser.roles.includes('premium') || activeUser.roles.includes('admin');
      if (!isPremium) {
        setUnauthorized(true);
        return;
      }

      // 4. Retrieve fresh token and redirect directly to backend PDF stream
      const freshToken = localStorage.getItem('access_token') || '';
      
      const isLocal = 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' || 
        window.location.hostname.startsWith('192.168.') ||
        window.location.hostname.startsWith('10.') ||
        window.location.hostname.endsWith('.local');

      const apiURL = isLocal 
        ? `${window.location.protocol}//${window.location.hostname}:8080` 
        : window.location.origin;
      
      // Redirect directly to the backend stream with query token.
      // The browser's native PDF reviewer will capture the application/pdf response.
      window.location.href = `${apiURL}/cms/reports/${id}/pdf?token=${encodeURIComponent(freshToken)}`;
    };

    checkAuthAndRedirect();
  }, [id, user, authLoading, navigate, setUser]);

  if (unauthorized) {
    return (
      <div 
        className="min-h-screen bg-[#111] bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-6 text-white font-poppins relative"
        style={{ backgroundImage: "url('/bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none"></div>
        
        {/* Floating gradient circles */}
        <div className="absolute w-[350px] h-[350px] rounded-full bg-red-500/5 blur-[80px] -top-10 -left-10 pointer-events-none"></div>
        <div className="absolute w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[100px] -bottom-20 -right-20 pointer-events-none"></div>

        {/* 404 Card */}
        <div className="relative z-10 max-w-[420px] w-full bg-[#161618]/85 border border-white/10 p-8 md:p-10 rounded-[32px] text-center shadow-2xl backdrop-blur-xl flex flex-col items-center gap-6">
          
          {/* Glowing Lock Icon */}
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500/90 shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-pulse">
            <Lock className="w-7 h-7" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-red-500/90">
              Error 404 • Access Denied
            </span>
            <h1 className="text-[26px] font-semibold tracking-tight text-white leading-tight">
              Report Not Found
            </h1>
            <p className="text-gray-400 text-[14px] leading-relaxed font-medium mt-1 px-2">
              The PDF report you are trying to view is either unavailable or requires an active <strong className="text-white">Annual Premium</strong> subscription.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full mt-2">
            <button
              onClick={() => navigate('/subscriptions')}
              className="w-full py-3.5 bg-white text-black hover:bg-gray-100 rounded-full font-semibold transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              Upgrade Membership
            </button>
            <button
              onClick={() => navigate('/home')}
              className="w-full py-3.5 bg-[#252528] text-white hover:bg-[#323236] border border-white/5 rounded-full font-semibold transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center text-white font-poppins">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-white/50" />
        <p className="text-sm font-medium tracking-wide text-gray-300">
          Decrypting & opening PDF in native viewer...
        </p>
      </div>
    </div>
  );
}

