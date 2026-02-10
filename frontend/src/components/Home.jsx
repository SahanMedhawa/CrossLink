import React from "react";
import Navbar from "./user/Navbar";
import HeroSection from "./user/HeroSection";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navbar />
      <HeroSection />
    </div>
  );
};

export default HomePage;
