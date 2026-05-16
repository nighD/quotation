import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ArticleList } from './pages/cms/ArticleList';
import { ArticleDetail } from './pages/public/ArticleDetail';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SubscriptionPlans } from './pages/subscriptions/SubscriptionPlans';
import { Profile } from './pages/auth/Profile';

function ProtectedRoute({ requireAdmin = false }: { requireAdmin?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !user.roles?.includes('admin')) return <Navigate to="/" replace />;
  return <Outlet />;
}

function AppContent() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/plans';

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/articles" replace />} />
        
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Public Content */}
        <Route path="/articles" element={<ArticleList />} />
        <Route path="/articles/:id" element={<ArticleDetail />} />
        <Route path="/plans" element={<SubscriptionPlans />} />
        
        {/* Payment Status */}
        <Route path="/payment/success" element={
          <div className="max-w-md mx-auto mt-20 p-10 verge-card border-verge-neon text-center">
            <h2 className="text-4xl font-display font-black text-verge-neon uppercase tracking-widest mb-4">Clearance Granted</h2>
            <p className="text-gray-400 font-sans">Payment successful. Your subscription is active.</p>
          </div>
        } />
        <Route path="/payment/failed" element={
          <div className="max-w-md mx-auto mt-20 p-10 verge-card border-verge-magenta text-center">
            <h2 className="text-4xl font-display font-black text-verge-magenta uppercase tracking-widest mb-4">Transaction Failed</h2>
            <p className="text-gray-400 font-sans">Unable to process payment. Please try again.</p>
          </div>
        } />
        
        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        {/* Admin Only */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
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
