import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Scissors, LogOut, User, LayoutDashboard, Calendar } from 'lucide-react';

const Navbar = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 mb-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-primary hover:text-yellow-400 transition">
          <Scissors size={28} />
          <span className="text-2xl font-bold tracking-wider">TRIMLY</span>
        </Link>
        
        <div className="flex items-center gap-6">
          {userInfo ? (
            <>
              <Link 
                to={userInfo.isAdmin ? "/admin/dashboard" : "/dashboard"} 
                className={`flex items-center gap-2 text-sm font-medium transition ${location.pathname.includes('dashboard') ? 'text-primary' : 'text-gray-300 hover:text-white'}`}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              
              <Link 
                to="/booking" 
                className={`flex items-center gap-2 text-sm font-medium transition ${location.pathname === '/booking' ? 'text-primary' : 'text-gray-300 hover:text-white'}`}
              >
                <Calendar size={18} />
                Book Now
              </Link>

              <div className="h-6 w-px bg-white/20"></div>

              <div className="flex items-center gap-2 text-gray-300">
                <User size={18} />
                <span className="text-sm">{userInfo.name}</span>
              </div>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition ml-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white font-medium transition">Login</Link>
              <Link to="/register" className="btn-primary flex items-center gap-2">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
