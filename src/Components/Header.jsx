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
    <nav className="flex justify-between items-center p-4 bg-gray-100 shadow">
      <div className="navbar-brand">
        <Link to="/" className="text-xl font-bold text-gray-800">
          <h2>BooksManagement</h2>
        </Link>
      </div>
      
      <div className="flex items-center">
        {authStatus === null ? (
         
          <div className="text-gray-600">Loading...</div>
        ) : authStatus ? (
         
          <div className="relative">
            <button 
              className="bg-transparent border-0 cursor-pointer p-0"
              onClick={toggleDropdown}
            >
              <img 
                src="https://imgs.search.brave.com/XFZsS2m9JIJrTs5NWuLWoFJLJSaFgpSt1zgYQDYf1L0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzE2LzA5LzU5LzM3/LzM2MF9GXzE2MDk1/OTM3OTVfQWUxUFBC/Z0dTaXkydEt3NEdX/WGVYSnRCVFFuM2RX/cG4uanBn" 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover" 
              />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full right-0 bg-white shadow-lg rounded z-10 py-2 mt-1">
                <button 
                  className="w-full px-4 py-2 text-left bg-transparent border-0 cursor-pointer hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          // User is not authenticated - show login/register buttons
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 bg-blue-500 text-white border-0 rounded cursor-pointer text-base"
              onClick={handleLogin}
            >
              Login
            </button>
            <button 
              className="px-4 py-2 bg-green-500 text-white border-0 rounded cursor-pointer text-base"
              onClick={handleRegister}
            >
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
