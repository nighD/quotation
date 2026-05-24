import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Profile } from './pages/auth/Profile';
import { SubscriptionPlans } from './pages/subscriptions/SubscriptionPlans';
import { Home, Reports, Deals, Benefits, Events } from './pages/public/Placeholders';
import { ReportDetail } from './pages/public/ReportDetail';
import { ReportPdf } from './pages/public/ReportPdf';
import { Landing } from './pages/public/Landing';

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
  const isProd = import.meta.env.PROD;

  // ==========================================
  // PRODUCTION ROUTING (Subdomain-enforced)
  // ==========================================
  if (isProd) {
    const isDashboard = hostname.startsWith('dashboard.');
    const dashboardDomainUrl = 'https://dashboard.vifcpass.com';

    // ─── 1. ROOT DOMAIN (vifcpass.com) ──────────────────────
    if (!isDashboard) {
      // Redirect all paths other than / to dashboard.vifcpass.com
      const currentPath = window.location.pathname;
      if (currentPath !== '/') {
        window.location.href = `${dashboardDomainUrl}${currentPath}${window.location.search}`;
        return <div className="min-h-screen bg-[#111] flex items-center justify-center text-white">Redirecting to Dashboard...</div>;
      }

      // Root path renders Landing page.
      // If user session exists, they can still view Landing, but clicking auth will take them to dashboard.
      return (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );
    }

    // ─── 2. DASHBOARD DOMAIN (dashboard.vifcpass.com) ────────
    const defaultPath = user ? "/home" : "/login";

    return (
      <Routes>
        {/* Root path redirect based on auth */}
        <Route path="/" element={user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
        <Route path="/plans" element={<PlansRedirect />} />

        {/* Auth routes (Only accessible when not logged in) */}
        <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/home" replace /> : <Register />} />

        {/* Protected Navigation Pages (Only accessible when logged in, otherwise redirect to login) */}
        <Route path="/home" element={!user ? <Navigate to="/login" replace /> : <Home />} />
        <Route path="/reports" element={!user ? <Navigate to="/login" replace /> : <Reports />} />
        <Route path="/reports/detail/:id" element={!user ? <Navigate to="/login" replace /> : <ReportDetail />} />
        <Route path="/reports/:id/pdf" element={!user ? <Navigate to="/login" replace /> : <ReportPdf />} />
        <Route path="/deals" element={!user ? <Navigate to="/login" replace /> : <Deals />} />
        <Route path="/benefits" element={!user ? <Navigate to="/login" replace /> : <Benefits />} />
        <Route path="/subscriptions" element={!user ? <Navigate to="/login" replace /> : <SubscriptionPlans />} />
        <Route path="/events" element={!user ? <Navigate to="/login" replace /> : <Events />} />
        <Route path="/profile" element={!user ? <Navigate to="/login" replace /> : <Profile />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={defaultPath} replace />} />
      </Routes>
    );
  }

  // ==========================================
  // LOCAL DEVELOPMENT ROUTING (Single-origin)
  // ==========================================
  const defaultPath = user ? "/home" : "/login";

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/home" replace /> : <Landing />} />
      <Route path="/plans" element={<PlansRedirect />} />
      
      {/* Auth */}
      <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/home" replace /> : <Register />} />
      
      {/* Protected Navigation Pages */}
      <Route path="/home" element={!user ? <Navigate to="/login" replace /> : <Home />} />
      <Route path="/reports" element={!user ? <Navigate to="/login" replace /> : <Reports />} />
      <Route path="/reports/detail/:id" element={!user ? <Navigate to="/login" replace /> : <ReportDetail />} />
      <Route path="/reports/:id/pdf" element={!user ? <Navigate to="/login" replace /> : <ReportPdf />} />
      <Route path="/deals" element={!user ? <Navigate to="/login" replace /> : <Deals />} />
      <Route path="/benefits" element={!user ? <Navigate to="/login" replace /> : <Benefits />} />
      <Route path="/subscriptions" element={!user ? <Navigate to="/login" replace /> : <SubscriptionPlans />} />
      <Route path="/events" element={!user ? <Navigate to="/login" replace /> : <Events />} />
      <Route path="/profile" element={!user ? <Navigate to="/login" replace /> : <Profile />} />
      
      {/* Catch-all */}
      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

