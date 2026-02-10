import React from "react";
import { Link } from "react-router-dom";
import DashboardMockup from "./DashboardMockup";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-30 blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-indigo-100 rounded-full opacity-40 blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-50 rounded-full opacity-25 blur-2xl"></div>
        <div className="absolute bottom-40 right-1/3 w-32 h-32 bg-indigo-50 rounded-full opacity-30 blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Connect. Collaborate.{" "}
                <span className="text-blue-600">Create Impact.</span>
              </h1>
              <p className="text-base sm:text-xl text-gray-600 leading-relaxed max-w-lg">
                CrossLink brings together NGOs, Volunteers, and Corporates to
                build meaningful partnerships and drive social change.
              </p>
            </div>

            <div className="flex flex-row items-center gap-3">
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
              >
                Get Started
              </Link>
              <Link
                to="/register"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-lg transition-all duration-200 text-center"
              >
                Volunteer Now
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-4 sm:space-x-6 pt-4">
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">100+</span> NGOs
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">5,000+</span>{" "}
                Volunteers
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">50+</span>{" "}
                Corporates
              </div>
            </div>
          </div>

          {/* Right Column - Dashboard Mockup */}
          <div className="relative lg:pl-8">
            <DashboardMockup />
          </div>
        </div>

        {/* Role Cards Section */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Who Can Join CrossLink?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">
                NGOs
              </h3>
              <p className="text-gray-600 text-center mt-2 text-sm">
                Post projects, find volunteers, and connect with corporate
                sponsors.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">
                Volunteers
              </h3>
              <p className="text-gray-600 text-center mt-2 text-sm">
                Discover causes you care about and contribute your skills.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-sky-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">
                Corporates
              </h3>
              <p className="text-gray-600 text-center mt-2 text-sm">
                Partner with NGOs for impactful CSR initiatives.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
