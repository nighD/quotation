import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { GoogleLogin } from '@react-oauth/google';
// import { Mail, Lock } from 'lucide-react';

const getCleanErrorMessage = (err: any, defaultMsg: string): string => {
  const serverMsg = err.response?.data?.message || '';
  if (
    serverMsg.includes('SQLSTATE') ||
    serverMsg.includes('failed to register social user') ||
    serverMsg.includes('column "') ||
    serverMsg.includes('relation "') ||
    serverMsg.includes('ERROR:')
  ) {
    return 'Something wrong. Please contact partner@goealliance.org for more information.';
  }
  return serverMsg || defaultMsg;
};

export function Login() {
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [, setLoading] = useState(false);

  const { login, devLogin } = useAuth();
  const navigate = useNavigate();

  // const handleEmailSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError('');
  //
  //   try {
  //     const { data } = await apiClient.post('/auth/login', { email, password });
  //     if (data.success) {
  //       login(data.data.access_token, data.data.refresh_token);
  //       navigate('/');
  //     }
  //   } catch (err: any) {
  //     setError(getCleanErrorMessage(err, 'Login failed. Please check your credentials.'));
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.post('/auth/social', {
        provider: 'google',
        token: credentialResponse.credential,
      });
      if (data.success) {
        login(data.data.access_token, data.data.refresh_token);
        navigate('/');
      }
    } catch (err: any) {
      setError(getCleanErrorMessage(err, 'Google Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async (role: 'admin' | 'user' = 'admin') => {
    setLoading(true);
    setError('');
    try {
      await devLogin(role);
      navigate('/');
    } catch (err: any) {
      setError(getCleanErrorMessage(err, 'Development login failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111] bg-cover bg-center bg-no-repeat flex flex-col font-poppins relative" style={{ backgroundImage: "url('/bg.png')" }}>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full pb-20">
        <div className="bg-[#181818] rounded-[32px] p-8 md:p-10 md:py-9 w-full max-w-[460px] shadow-2xl border border-white/5">
          <h2 className="text-[28px] font-semibold text-white text-center mb-6 tracking-tight">
            Sign in
          </h2>

          {/* Quick Dev Login Bypass Box */}
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-[18px]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Dev Bypass / Access Dashboard
              </span>
            </div>
            <p className="text-[#a1a1aa] text-xs mb-3 leading-relaxed">
              Bỏ qua Google OAuth (lỗi Client ID trên localhost) để truy cập trực tiếp:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void handleDevLogin('admin')}
                className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1"
              >
                <span>⚡ Admin Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => void handleDevLogin('user')}
                className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1 border border-white/10"
              >
                <span>👤 User Dashboard</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {/* Custom Google Button UI with hidden real button on top */}
          <div className="relative w-full h-13.5 rounded-[14px] overflow-hidden bg-white hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center">
            <div className="absolute inset-0 z-0 flex items-center justify-center gap-3 pointer-events-none">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5.5 h-5.5" />
              <span className="text-black font-medium text-[16px]">Continue with Google</span>
            </div>

            {/* Invisible real button, scaled up to guarantee it fills the entire 54px height click area */}
            <div className="absolute z-10 opacity-[0.01]" style={{ transform: 'scale(1.5)' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Client ID chưa được cấu hình cho localhost. Vui lòng bấm "⚡ Admin Dashboard" ở trên để truy cập nhanh.')}
                text="continue_with"
                width="350"
              />
            </div>
          </div>

          {/* <div className="relative flex items-center justify-center my-8">
            <div className="absolute inset-x-0 h-px bg-[#2a2a2a]"></div>
            <span className="relative px-4 bg-[#181818] text-[#777] text-[15px]">or</span>
          </div>

          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block mb-2 text-[14px] text-[#8c8c8c]">Email</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-[22px] h-[22px] text-[#666] pointer-events-none" strokeWidth={1.5} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                  className="w-full bg-[#121212] text-white text-[15px] rounded-[14px] py-4 pl-[3.25rem] pr-4 outline-none border border-transparent focus:border-gray-500 transition placeholder:text-[#666]"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-[14px] text-[#8c8c8c]">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-[22px] h-[22px] text-[#666] pointer-events-none" strokeWidth={1.5} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="********"
                  className="w-full bg-[#121212] text-white text-[15px] rounded-[14px] py-4 pl-[3.25rem] pr-4 outline-none border border-transparent focus:border-gray-500 transition placeholder:text-[#666]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 mx-auto block bg-white text-black px-12 py-[12px] rounded-full font-medium text-[16px] hover:bg-gray-200 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? 'Processing...' : 'Sign in'}
            </button>
          </form> */}

          {/* <p className="text-center mt-8 text-[#777] text-[15px]">
            Don't have an account? <Link to="/register" className="text-[#a1a1aa] hover:text-white underline decoration-1 underline-offset-[5px] transition">Sign up</Link>
          </p> */}
        </div>
      </div>
    </div>
  );
}
