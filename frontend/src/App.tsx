import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Profile } from './pages/auth/Profile';
import { SubscriptionPlans } from './pages/subscriptions/SubscriptionPlans';
import { Home, Reports, Deals, Benefits, Events } from './pages/public/Placeholders';
import { ReportDetail } from './pages/public/ReportDetail';

function PlansRedirect() {
  const [searchParams] = useSearchParams();
  const payment = searchParams.get('payment');
  return <Navigate to={`/home${payment ? `?payment=${payment}` : ''}`} replace />;
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-[#111] flex items-center justify-center text-white">Loading...</div>;
  }

  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';
  const isProd = import.meta.env.PROD;

  const isDashboard = hostname.startsWith('dashboard.');

  let rootDomainUrl = `${window.location.protocol}//${hostname.replace(/^dashboard\./, '')}${port}`;
  let dashboardDomainUrl = `${window.location.protocol}//dashboard.${hostname.replace(/^dashboard\./, '')}${port}`;

  if (isProd) {
    rootDomainUrl = 'https://vifcpass.com';
    dashboardDomainUrl = 'https://dashboard.vifcpass.com';
  }

  // Subdomain redirection rules
  if (!isDashboard) {
    // If user is authenticated on root domain (vifcpass.com), redirect to dashboard
    if (user) {
      window.location.href = `${dashboardDomainUrl}/home${window.location.search}`;
      return <div className="min-h-screen bg-[#111] flex items-center justify-center text-white">Redirecting to Dashboard...</div>;
    }
  } else {
    // If user is unauthenticated on dashboard (dashboard.vifcpass.com), redirect to login page on root domain
    if (!user) {
      window.location.href = `${rootDomainUrl}/login`;
      return <div className="min-h-screen bg-[#111] flex items-center justify-center text-white">Redirecting to Login...</div>;
    }
  }

  const defaultPath = isDashboard ? "/home" : "/login";

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={defaultPath} replace />} />
        <Route path="/plans" element={<PlansRedirect />} />
        
        {/* Auth (Only accessible on root domain when logged out) */}
        <Route path="/login" element={isDashboard ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/register" element={isDashboard ? <Navigate to="/home" replace /> : <Register />} />
        
        {/* Protected Navigation Pages (Only accessible on dashboard when logged in) */}
        <Route path="/home" element={!isDashboard ? <Navigate to="/login" replace /> : <Home />} />
        <Route path="/reports" element={!isDashboard ? <Navigate to="/login" replace /> : <Reports />} />
        <Route path="/reports/detail/:id" element={!isDashboard ? <Navigate to="/login" replace /> : <ReportDetail />} />
        <Route path="/deals" element={!isDashboard ? <Navigate to="/login" replace /> : <Deals />} />
        <Route path="/benefits" element={!isDashboard ? <Navigate to="/login" replace /> : <Benefits />} />
        <Route path="/subscriptions" element={!isDashboard ? <Navigate to="/login" replace /> : <SubscriptionPlans />} />
        <Route path="/events" element={!isDashboard ? <Navigate to="/login" replace /> : <Events />} />
        <Route path="/profile" element={!isDashboard ? <Navigate to="/login" replace /> : <Profile />} />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to={defaultPath} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

