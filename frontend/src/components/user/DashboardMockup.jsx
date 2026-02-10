import React from "react";

const DashboardMockup = () => {
  return (
    <div className="relative">
      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-white font-semibold text-lg">
                CrossLink Collaboration Hub
              </h3>
              <p className="text-blue-100 text-sm">Live Matches • Today</p>
            </div>
            <span className="flex items-center text-sm text-white">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Active
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-xs text-blue-600">Active NGOs</div>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-indigo-600">8</div>
              <div className="text-xs text-indigo-600">Corporate Partners</div>
            </div>
            <div className="bg-sky-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-sky-600">27</div>
              <div className="text-xs text-sky-600">Volunteers</div>
            </div>
          </div>

          {/* Featured Match */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-5">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <span className="mr-2">🔗</span> Featured Match
            </h4>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-blue-700">GreenEarth NGO</span>{" "}
              matched with{" "}
              <span className="font-medium text-indigo-700">TechCorp Ltd</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Focus: Community Development • 15 Volunteers Needed
            </p>
          </div>

          {/* Match Queue */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800 text-sm mb-3">
              Pending Match Requests
            </h4>

            {[
              {
                org: "Hope Foundation",
                type: "NGO",
                focus: "Education",
                status: "Reviewing",
              },
              {
                org: "OceanAid",
                type: "NGO",
                focus: "Marine Conservation",
                status: "Matched",
              },
              {
                org: "BuildFuture Ltd",
                type: "Corporate",
                focus: "CSR Volunteering",
                status: "Pending",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <div className="min-w-0">
                  <div className="font-medium text-gray-800 text-sm truncate">
                    {item.org}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {item.type} • {item.focus}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium text-left whitespace-nowrap ${
                    item.status === "Matched"
                      ? "bg-blue-100 text-blue-700"
                      : item.status === "Reviewing"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-indigo-100 text-indigo-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-5 flex space-x-2">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
              Create Match
            </button>
            <button className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors">
              View All
            </button>
          </div>
        </div>
      </div>

      {/* Floating Notification */}
      <div className="absolute -top-4 -right-4 bg-white border border-gray-200 shadow-lg rounded-lg p-3 max-w-[180px] animate-bounce">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-800">New Match!</div>
            <div className="text-[10px] text-gray-500">OceanAid × BlueWave</div>
          </div>
        </div>
      </div>

      {/* Second Floating Element */}
      <div className="absolute -bottom-3 -left-3 bg-white border border-gray-200 shadow-lg rounded-lg p-2.5 flex items-center gap-2">
        <div className="flex -space-x-2">
          <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
            A
          </div>
          <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
            B
          </div>
          <div className="w-7 h-7 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
            C
          </div>
        </div>
        <span className="text-xs text-gray-600 font-medium">+24 online</span>
      </div>
    </div>
  );
};

export default DashboardMockup;
