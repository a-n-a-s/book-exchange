import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser, isAuthenticated } from "../db/db.action";

const Header = () => {
  const [authStatus, setAuthStatus] = useState(null); 
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const status = await isAuthenticated();
      setAuthStatus(status);
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    
    navigate('/login');
  };

  const handleRegister = () => {
   
    navigate('/register');
  };

  const handleLogout = async () => {
    await logoutUser();
    setAuthStatus(false);
    setDropdownOpen(false);
    
    navigate('/');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="navbar-brand">
          <Link to="/" className="text-2xl font-bold text-slate-800 tracking-tight hover:text-blue-600 transition-colors">
            BooksManagement
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          {authStatus === null ? (
            <div className="text-slate-500 text-sm font-medium animate-pulse">Loading...</div>
          ) : authStatus ? (
            <div className="relative group">
              <button 
                className="flex items-center gap-3 focus:outline-none"
                onClick={toggleDropdown}
              >
                <span className="hidden md:block text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">My Account</span>
                <img 
                  src="https://imgs.search.brave.com/XFZsS2m9JIJrTs5NWuLWoFJLJSaFgpSt1zgYQDYf1L0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzE2LzA5LzU5LzM3/LzM2MF9GXzE2MDk1/OTM3OTVfQWUxUFBC/Z0dTaXkydEt3NEdX/WGVYSnRCVFFuM2RX/cG4uanBn" 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all" 
                />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <button 
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button 
                className="px-5 py-2.5 text-slate-600 font-medium text-sm hover:text-blue-600 transition-colors"
                onClick={handleLogin}
              >
                Log In
              </button>
              <button 
                className="px-5 py-2.5 bg-slate-900 text-white font-medium text-sm rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5"
                onClick={handleRegister}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
