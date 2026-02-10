import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import Logo from "./logo";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, getRedirectPath } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  const handleDashboard = () => {
    setShowDropdown(false);
    navigate(getRedirectPath());
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "volunteer": return "Volunteer";
      case "ngo": return "NGO";
      case "corporate": return "Corporate";
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "volunteer": return "from-blue-500 to-blue-600";
      case "ngo": return "from-blue-600 to-indigo-600";
      case "corporate": return "from-blue-600 to-indigo-600";
      default: return "from-gray-600 to-gray-700";
    }
  };

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/">
            <Logo />
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Home
            </Link>
            <a
              href="/projects"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Projects
            </a>
            <a
              href="/ngos"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              NGOs
            </a>
            <a
              href="#about"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              About
            </a>
            <a
              href="#how-it-works"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              How It Works
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 rounded-2xl px-2 py-1.5 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <div className={`h-9 w-9 rounded-full bg-gradient-to-r ${getRoleColor(user.userType)} flex items-center justify-center text-white text-sm shadow-sm overflow-hidden`}>
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.parentElement) {
                            e.target.parentElement.textContent = user.name.charAt(0);
                          }
                        }}
                      />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div className="text-left leading-tight hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{getRoleLabel(user.userType)}</p>
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl z-50 border border-gray-100 overflow-hidden">
                    {/* User info */}
                    <div className={`px-5 py-4 bg-gradient-to-r ${getRoleColor(user.userType)} text-white`}>
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-white text-lg overflow-hidden">
                          {user.photoURL ? (
                            <img 
                              src={user.photoURL} 
                              alt={user.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.parentElement) {
                                  e.target.parentElement.textContent = user.name.charAt(0);
                                }
                              }}
                            />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{user.name}</p>
                          <p className="text-xs text-white/80">{user.email}</p>
                          <p className="text-xs text-white/80 mt-1">
                            {getRoleLabel(user.userType)} Account
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="py-2">
                      <button
                        onClick={handleDashboard}
                        className="flex items-center w-full px-5 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Go to Dashboard
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-5 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md px-4 py-3 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
          >
            Home
          </Link>
          <Link
            to="/projects"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
          >
            Projects
          </Link>
          <Link
            to="/ngos"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
          >
            NGOs
          </Link>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
          >
            About
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
          >
            How It Works
          </a>
          {!isAuthenticated && (
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-gray-700 hover:text-blue-600 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
