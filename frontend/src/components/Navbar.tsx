import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, User as UserIcon, FileText, CreditCard } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.roles?.includes('admin');

  return (
    <nav className="sticky top-0 z-50 bg-verge-black border-b-4 border-verge-magenta px-4 py-4 uppercase font-display font-black tracking-widest text-sm text-verge-white shadow-[0_4px_0_0_rgba(232,18,92,1)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl text-verge-neon hover:text-white transition-colors flex items-center gap-2">
          Quotation
        </Link>

        <div className="flex items-center gap-6">
          <Link 
            to="/articles" 
            className="flex items-center gap-2 hover:text-verge-magenta transition-colors"
          >
            <FileText size={16} /> Articles
          </Link>
          <Link 
            to="/plans" 
            className="flex items-center gap-2 hover:text-verge-neon transition-colors"
          >
            <CreditCard size={16} /> Plans
          </Link>

          {user ? (
            <>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="flex items-center gap-2 text-verge-yellow hover:text-white transition-colors"
                >
                  <LayoutDashboard size={16} /> Admin
                </Link>
              )}
              <Link 
                to="/profile" 
                className="flex items-center gap-2 text-gray-400 hover:text-verge-magenta transition-colors"
              >
                <UserIcon size={16} /> {user.full_name}
              </Link>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 text-gray-400 hover:text-verge-magenta transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4 border-l-2 border-verge-border pl-6 ml-2">
              <Link 
                to="/login" 
                className="hover:text-verge-magenta transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-verge-white text-verge-black px-4 py-2 hover:bg-verge-magenta hover:text-white transition-all"
              >
                Subscribe
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
