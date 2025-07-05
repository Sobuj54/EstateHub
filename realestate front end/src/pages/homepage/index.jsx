import React, { useState, useEffect } from "react";

import Header from "../../components/ui/Header";

import HeroSection from "./components/HeroSection";
import FeaturedProperties from "./components/FeaturedProperties";
import QuickStats from "./components/QuickStats";
import AgentSpotlight from "./components/AgentSpotlight";
import Footer from "./components/Footer";
import { Helmet } from "react-helmet";

const Homepage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial content loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (searchParams) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    window.location.href = `/property-listings?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 lg:pt-18">
          {/* Hero Skeleton */}
          <div className="relative h-[600px] bg-secondary-100 skeleton"></div>

          {/* Content Skeletons */}
          <div className="px-4 py-16 mx-auto space-y-16 max-w-7xl sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg bg-surface shadow-elevation-1"
                >
                  <div className="h-48 bg-secondary-100 skeleton"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 rounded bg-secondary-100 skeleton"></div>
                    <div className="w-3/4 h-4 rounded bg-secondary-100 skeleton"></div>
                    <div className="w-1/2 h-4 rounded bg-secondary-100 skeleton"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>EstateHub | Home</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-16 lg:pt-18">
          <HeroSection onSearch={handleSearch} />
          <FeaturedProperties />
          <QuickStats />
          <AgentSpotlight />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Homepage;
