import React from "react";
import Navbar from "../components/user/Navbar";

const NGOs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-100 p-4 sm:p-8 text-left">
          <div className="flex items-center justify-between flex-wrap gap-4 text-left">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 text-left">
                NGOs
              </h1>
              <p className="text-gray-600 mt-2">
                NGO profiles will be available soon.
              </p>
            </div>
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full">
              Coming soon
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
            {[
              { name: "Hope Foundation", focus: "Education" },
              { name: "OceanAid", focus: "Marine Conservation" },
              { name: "CareBridge", focus: "Community Health" },
            ].map((ngo, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-100"
              >
                <div className="text-sm text-indigo-600 font-semibold">
                  {ngo.focus}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mt-2">
                  {ngo.name}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Profiles will be visible once listings are enabled.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NGOs;
