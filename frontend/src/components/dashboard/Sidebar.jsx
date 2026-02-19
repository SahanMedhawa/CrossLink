import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  ChevronDoubleLeftIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  FolderIcon,
  BuildingOfficeIcon,
  HeartIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const Sidebar = ({ sidebarOpen, setSidebarOpen, isMobile, userType }) => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  // Navigation items based on user type
  const getNavigationItems = () => {
    switch (userType) {
      case "volunteer":
        return [
          {
            name: "Dashboard",
            href: "/volunteer/dashboard",
            icon: <HomeIcon className="w-5 h-5" />,
          },
          {
            name: "Find Projects",
            href: "/volunteer/projects",
            icon: <MagnifyingGlassIcon className="w-5 h-5" />,
          },
          {
            name: "My Applications",
            href: "/volunteer/applications",
            icon: <DocumentTextIcon className="w-5 h-5" />,
          },
          {
            name: "Browse NGOs",
            href: "/volunteer/ngos",
            icon: <BuildingOfficeIcon className="w-5 h-5" />,
          },
          {
            name: "My Activity",
            href: "/volunteer/activity",
            icon: <ClockIcon className="w-5 h-5" />,
          },
          {
            name: "Profile",
            href: "/volunteer/profile",
            icon: <UserIcon className="w-5 h-5" />,
          },
        ];
      case "ngo":
        return [
          {
            name: "Dashboard",
            href: "/ngo/dashboard",
            icon: <HomeIcon className="w-5 h-5" />,
          },
          {
            name: "Projects",
            href: "/ngo/ngoprojects",
            icon: <FolderIcon className="w-5 h-5" />,
          },
          {
            name: "Volunteers",
            href: "/ngo/volunteers",
            icon: <UserGroupIcon className="w-5 h-5" />,
          },
          {
            name: "Corporate Partners",
            href: "/ngo/partners",
            icon: <BriefcaseIcon className="w-5 h-5" />,
          },
          {
            name: "Reports",
            href: "/ngo/reports",
            icon: <ChartBarIcon className="w-5 h-5" />,
          },
          {
            name: "Settings",
            href: "/ngo/settings",
            icon: <Cog6ToothIcon className="w-5 h-5" />,
          },
        ];
      case "corporate":
        return [
          {
            name: "Dashboard",
            href: "/corporate/dashboard",
            icon: <HomeIcon className="w-5 h-5" />,
          },
          {
            name: "CSR Initiatives",
            href: "/corporate/initiatives",
            icon: <HeartIcon className="w-5 h-5" />,
          },
          {
            name: "NGO Partners",
            href: "/corporate/partners",
            icon: <BuildingOfficeIcon className="w-5 h-5" />,
          },
          {
            name: "Employee Volunteering",
            href: "/corporate/volunteering",
            icon: <UserGroupIcon className="w-5 h-5" />,
          },
          {
            name: "Impact Reports",
            href: "/corporate/reports",
            icon: <ChartBarIcon className="w-5 h-5" />,
          },
          {
            name: "Settings",
            href: "/corporate/settings",
            icon: <Cog6ToothIcon className="w-5 h-5" />,
          },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  const getRoleLabel = () => {
    switch (userType) {
      case "volunteer":
        return "Volunteer Portal";
      case "ngo":
        return "NGO Portal";
      case "corporate":
        return "Corporate Portal";
      default:
        return "Portal";
    }
  };

  const getRoleIcon = () => {
    switch (userType) {
      case "volunteer":
        return "V";
      case "ngo":
        return "N";
      case "corporate":
        return "C";
      default:
        return "X";
    }
  };

  const sidebarClasses = `
    ${isMobile ? "fixed inset-y-0 left-0 z-40" : "relative"}
    ${isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
    ${isMobile ? "w-64" : isOpen ? "w-64" : "w-20"}
    bg-white border-r border-gray-200 shadow-xl transition-all duration-300 ease-in-out flex flex-col
  `;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={sidebarClasses}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-sm">
              {getRoleIcon()}
            </div>
            <span
              className={`ml-3 font-semibold text-gray-800 ${
                !isOpen && !isMobile ? "hidden" : "block"
              }`}
            >
              {getRoleLabel()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {!isMobile && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                aria-label="Collapse sidebar"
              >
                <ChevronDoubleLeftIcon
                  className={`w-5 h-5 transition-transform ${
                    isOpen ? "rotate-0" : "rotate-180"
                  }`}
                />
              </button>
            )}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                aria-label="Close sidebar"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`group flex items-center w-full text-left px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 ring-1 ring-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mr-3 ${
                    isActive
                      ? "bg-white text-blue-600 shadow-sm"
                      : "bg-gray-100 text-gray-600 group-hover:bg-white group-hover:shadow-sm"
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-left ${
                    !isOpen && !isMobile ? "hidden" : "block"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-200">
          <div
            className={`flex items-center ${
              !isOpen && !isMobile ? "justify-center" : "justify-between"
            }`}
          >
            <span
              className={`text-xs text-gray-500 ${
                !isOpen && !isMobile ? "hidden" : "block"
              }`}
            >
              CrossLink v1.0
            </span>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span
                className={`ml-1 text-xs text-gray-500 ${
                  !isOpen && !isMobile ? "hidden" : "block"
                }`}
              >
                Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;