import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UserIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { resolveImageUrl } from "../../utils/imageUrl";
import { getProfile } from "../../services/api";

const Header = ({ setSidebarOpen, userType }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const refreshUserProfile = async () => {
      if (!user) return;

      try {
        const response = await getProfile();
        if (response?.success && response?.data) {
          setUser(response.data);
        }
      } catch (error) {
        // Ignore profile sync errors in header; existing auth state remains usable.
      }
    };

    refreshUserProfile();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const handleViewProfile = () => {
  setIsDropdownOpen(false);

  switch (roleValue) {
    case "ngo":
      navigate("/ngo/profile");
      break;

    case "volunteer":
      navigate("/volunteer/profile");
      break;

    case "corporate":
      navigate("/corporate/profile");
      break;

    default:
      navigate("/profile");
  }
};

  const getRoleLabel = () => {
    switch (userType) {
      case "volunteer":
        return "Volunteer";
      case "ngo":
        return "NGO Partner";
      case "corporate":
        return "Corporate Partner";
      default:
        return "User";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "volunteer":
        return "from-blue-500 to-blue-600";
      case "ngo":
        return "from-blue-600 to-indigo-600";
      case "corporate":
        return "from-blue-600 to-indigo-600";
      default:
        return "from-gray-600 to-gray-700";
    }
  };

  const roleValue = user?.userType || userType;

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: "New opportunity available",
      message: "A new volunteer opportunity matches your interests",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Application accepted",
      message: "Your application has been approved",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "Reminder",
      message: "Don't forget your upcoming event",
      time: "2 hours ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side - Mobile menu button and greeting */}
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 mr-3 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="Open sidebar"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-gray-800">
              {getGreeting()},{" "}
              <span className="text-blue-600">{user?.name || "User"}</span>
            </h1>
            <p className="text-sm text-gray-500">{getCurrentDate()}</p>
          </div>
        </div>

        {/* Right side - Notifications and profile */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Notifications"
            >
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg ring-1 ring-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                        notification.unread ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start">
                        {notification.unread && (
                          <span className="w-2 h-2 mt-1.5 mr-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                        <div className={notification.unread ? "" : "ml-4"}>
                          <p className="text-sm font-medium text-gray-800">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-center">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 rounded-2xl px-2 py-1.5 hover:bg-gray-100 transition-colors"
              aria-label="User menu"
            >
              <div
                className={`w-9 h-9 rounded-full bg-gradient-to-r ${getRoleColor(
                  roleValue
                )} flex items-center justify-center text-white font-semibold text-sm shadow-sm overflow-hidden`}
              >
                {user?.photoURL ? (
                  <img
                    src={resolveImageUrl(user.photoURL)}
                    alt={user?.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500">{getRoleLabel()}</p>
              </div>
              <ChevronDownIcon
                className={`h-4 w-4 text-gray-500 hidden md:block transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div
                  className={`px-5 py-4 bg-gradient-to-r ${getRoleColor(
                    roleValue
                  )} text-white`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-white text-lg">
                      {user?.photoURL ? (
                        <img
                          src={resolveImageUrl(user.photoURL)}
                          alt={user?.name || 'User'}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user?.name?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-white/80">
                        {user?.email || "user@example.com"}
                      </p>
                      <p className="text-xs text-white/80 mt-1">
                        {getRoleLabel()} Account
                      </p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/");
                    }}
                    className="flex items-center w-full px-5 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <HomeIcon className="h-4 w-4 mr-3 text-gray-400" />
                    Back to Home
                  </button>
                  <button
                      type="button"
                      onClick={handleViewProfile}
                      className="flex items-center w-full px-5 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
                      View Profile
                    </button>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center w-full px-5 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    aria-disabled="true"
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-3 text-gray-400" />
                    Settings
                  </button>
                </div>
                <div className="border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-5 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
