import { GoogleLogin } from '@react-oauth/google';
import { Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    setEmailError('');
    setPasswordError('');
    setError('');

    if (!email.trim()) {
      setEmailError('Email là bắt buộc');
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError('Mật khẩu là bắt buộc');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      if (data.success) {
        login(data.data.access_token, data.data.refresh_token);
        navigate('/');
      }
    } catch (err: any) {
      setError(getCleanErrorMessage(err, 'Login failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-[#111] bg-cover bg-top bg-no-repeat flex flex-col font-poppins relative" style={{ backgroundImage: "url('/bg-login.png')" }}>
      <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full pb-20">
        <div className="bg-[#181818] rounded-4xl p-8 md:p-10 md:py-9 w-full max-w-115 shadow-2xl border border-white/5">
          <h2 className="text-[28px] font-semibold text-white text-center mb-6 tracking-tight">
            Sign In
          </h2>


          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div className="relative w-full h-13.5 rounded-[14px] overflow-hidden bg-white hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center">
            <div className="absolute inset-0 z-0 flex items-center justify-center gap-3 pointer-events-none">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5.5 h-5.5" />
              <span className="text-black font-medium text-[16px]">Continue with Google</span>
            </div>

            <div className="absolute z-10 opacity-[0.01]" style={{ transform: 'scale(1.5)' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Client ID chưa được cấu hình cho localhost.')}
                text="continue_with"
                width="350"
              />
            </div>
          </div>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-x-0 h-px bg-white/10"></div>
            <span className="relative px-4 bg-[#181818] text-[#8c8c8c] text-[14px]">or</span>
          </div>

          <form onSubmit={handleEmailSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <label className="block mb-2 text-[14px] text-[#a1a1aa]">Email</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-5 h-5 text-white/60 pointer-events-none" strokeWidth={1.5} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="your.email@example.com"
                  className={`w-full bg-[#313131] text-white/60 placeholder:text-white/40 text-[15px] rounded-[14px] py-3.5 pl-12 pr-4 outline-none border transition ${emailError ? 'border-red-500/80 focus:border-red-500' : 'border-transparent focus:border-white/30'
                    }`}
                />
              </div>
              {emailError && (
                <p className="mt-1.5 text-[13px] text-red-500 font-['Inter'] font-medium">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-[14px] text-[#a1a1aa]">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-5 h-5 text-white/60 pointer-events-none" strokeWidth={1.5} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="********"
                  className={`w-full bg-[#313131] text-white/60 placeholder:text-white/40 text-[15px] rounded-[14px] py-3.5 pl-12 pr-4 outline-none border transition ${passwordError ? 'border-red-500/80 focus:border-red-500' : 'border-transparent focus:border-white/30'
                    }`}
                />
              </div>
              {passwordError && (
                <p className="mt-1.5 text-[13px] text-red-500 font-['Inter'] font-medium">{passwordError}</p>
              )}
            </div>

            <div className="flex justify-center mt-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-white text-black font-medium text-[15px] px-9 py-2.5 rounded-full hover:bg-gray-100 transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? 'Processing...' : 'Sign in'}
              </button>
            </div>
          </form>


        </div>
      </div>
    </div>
  );
}

