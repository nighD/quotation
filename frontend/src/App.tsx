import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Login } from "./pages/auth/Login";
import { Profile } from "./pages/auth/Profile";
import { SubscriptionPlans } from "./pages/subscriptions/SubscriptionPlans";
import { Reports, Deals, Benefits, Events } from "./pages/public/Placeholders";
import { ReportDetail } from "./pages/public/ReportDetail";
import { ReportPdf } from "./pages/public/ReportPdf";
import { Landing } from "./pages/public/Landing/page";
import { AdminDashboard } from "./pages/(dashboard)/admin/AdminDashboard";
import { NotificationsPage } from "./pages/(dashboard)/admin/NotificationsPage";
import ReportPage from "./pages/(dashboard)/report/page";
import ReportDetailPage from "./pages/(dashboard)/report/[slug]/page";
import BookingPage from "./pages/(dashboard)/booking/page";
import { AdminLayout } from "./pages/(dashboard)/_layouts";

function PlansRedirect() {
  const [searchParams] = useSearchParams();
  const payment = searchParams.get("payment");
  return <Navigate to={`/${payment ? `?payment=${payment}` : ""}`} replace />;
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-[#111] flex items-center justify-center text-white">Loading...</div>;
  }

  const hostname = window.location.hostname;
  const isProd = import.meta.env.PROD;

  if (isProd) {
    const isVercel = hostname.includes("vercel.app");
    const isDashboard = hostname.startsWith("dashboard.") || isVercel || hostname.includes("goealliance.org");
    const dashboardDomainUrl = hostname.includes("goealliance.org") ? "https://on-chaincard.goealliance.org" : "https://dashboard.vifcpass.com";

    if (!isDashboard) {
      // Redirect all paths other than / to dashboard.vifcpass.com
      const currentPath = window.location.pathname;
      if (currentPath !== "/") {
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
    const defaultPath = user ? "/" : "/login";

    return (
      <Routes>
        <Route path="/plans" element={<PlansRedirect />} />

        {/* Auth routes (Only accessible when not logged in) */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

        {/* Protected Navigation Pages (Only accessible when logged in, otherwise redirect to login) */}
        <Route path="/reports" element={!user ? <Navigate to="/login" replace /> : <Reports />} />
        <Route path="/reports/detail/:id" element={!user ? <Navigate to="/login" replace /> : <ReportDetail />} />
        <Route path="/reports/:id/pdf" element={!user ? <Navigate to="/login" replace /> : <ReportPdf />} />
        <Route path="/deals" element={!user ? <Navigate to="/login" replace /> : <Deals />} />
        <Route path="/benefits" element={!user ? <Navigate to="/login" replace /> : <Benefits />} />
        <Route path="/subscriptions" element={!user ? <Navigate to="/login" replace /> : <SubscriptionPlans />} />
        <Route path="/events" element={!user ? <Navigate to="/login" replace /> : <Events />} />
        <Route path="/profile" element={!user ? <Navigate to="/login" replace /> : <Profile />} />
        {/* Admin Section (Shared Layout prevents Sidebar reload/flicker) */}
        <Route element={!user ? <Navigate to="/login" replace /> : <AdminLayout />}>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/report/:slug" element={<ReportDetailPage />} />
          <Route path="/admin/report" element={<ReportPage />} />
          <Route path="/admin/report/:slug" element={<ReportDetailPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/admin/booking" element={<BookingPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/admin/notifications" element={<NotificationsPage />} />
          {/* Direct other unbuilt sub-routes back to / */}
          <Route path="/admin/*" element={<Navigate to="/" replace />} />
          <Route path="/booking/*" element={<Navigate to="/booking" replace />} />
          <Route path="/report/*" element={<Navigate to="/report" replace />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={defaultPath} replace />} />
      </Routes>
    );
  }

  // ==========================================
  // LOCAL DEVELOPMENT ROUTING (Single-origin)
  // ==========================================
  const defaultPath = user ? "/" : "/login";

  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route path="/plans" element={<PlansRedirect />} />

      {/* Auth */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      {/* Protected Navigation Pages */}
      <Route path="/reports" element={!user ? <Navigate to="/login" replace /> : <Reports />} />
      <Route path="/reports/detail/:id" element={!user ? <Navigate to="/login" replace /> : <ReportDetail />} />
      <Route path="/reports/:id/pdf" element={!user ? <Navigate to="/login" replace /> : <ReportPdf />} />
      <Route path="/deals" element={!user ? <Navigate to="/login" replace /> : <Deals />} />
      <Route path="/benefits" element={!user ? <Navigate to="/login" replace /> : <Benefits />} />
      <Route path="/subscriptions" element={!user ? <Navigate to="/login" replace /> : <SubscriptionPlans />} />
      <Route path="/events" element={!user ? <Navigate to="/login" replace /> : <Events />} />
      <Route path="/profile" element={!user ? <Navigate to="/login" replace /> : <Profile />} />

      {/* Admin Section (Shared Layout prevents Sidebar reload/flicker) */}
      <Route element={!user ? <Navigate to="/login" replace /> : <AdminLayout />}>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/report/:slug" element={<ReportDetailPage />} />
        <Route path="/admin/report" element={<ReportPage />} />
        <Route path="/admin/report/:slug" element={<ReportDetailPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/admin/booking" element={<BookingPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/admin/notifications" element={<NotificationsPage />} />
        {/* Direct other unbuilt sub-routes back to / */}
        <Route path="/admin/*" element={<Navigate to="/" replace />} />
        <Route path="/booking/*" element={<Navigate to="/booking" replace />} />
        <Route path="/report/*" element={<Navigate to="/report" replace />} />
      </Route>

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
