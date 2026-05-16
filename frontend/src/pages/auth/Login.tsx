import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { GoogleLogin } from '@react-oauth/google';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      if (data.success) {
        login(data.data.access_token, data.data.refresh_token);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
      const details = err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : '';
      setError(`${err.response?.data?.message || 'Google Login failed.'} ${details}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <div className="verge-card border-verge-magenta shadow-[8px_8px_0px_0px_rgba(232,18,92,1)] bg-verge-gray">
        <h2 className="text-4xl font-display font-black text-center mb-8 uppercase tracking-widest text-verge-white">
          Identify
        </h2>
        
        {error && (
          <div className="mb-6 p-4 border-2 border-verge-magenta text-verge-magenta font-bold uppercase tracking-wider text-sm text-center">
            {error}
          </div>
        )}
        
        <div className="flex justify-center mb-8">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed')}
            text="signin_with"
            theme="filled_black"
          />
        </div>

        <div className="text-center my-6 text-gray-500 font-display text-sm tracking-widest border-b-2 border-verge-border leading-[0.1em]">
          <span className="bg-verge-gray px-4 uppercase">Or Input Credentials</span>
        </div>

        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block mb-2 font-display uppercase tracking-widest text-sm text-verge-neon">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="operator@quotation.net"
              className="verge-input"
            />
          </div>
          <div>
            <label className="block mb-2 font-display uppercase tracking-widest text-sm text-verge-neon">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
              className="verge-input"
            />
          </div>
          <button type="submit" disabled={loading} className="verge-button mt-4 bg-verge-magenta border-verge-magenta text-white">
            {loading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>
        <p className="text-center mt-8 font-sans text-gray-400">
          No clearance? <Link to="/register" className="text-verge-magenta hover:text-white underline decoration-2 underline-offset-4">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
