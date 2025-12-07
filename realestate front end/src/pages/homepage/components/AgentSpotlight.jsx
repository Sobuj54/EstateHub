// src/components/AgentSpotlight.jsx
import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";

const API = import.meta.env.VITE_API;

const fetchVerifiedAgents = async () => {
  const res = await axios.get(`${API}/users/agents/verified`, {
    params: { limit: 3, pageNo: 1 },
  });
  return res.data?.data?.users ?? [];
};

const AgentSpotlight = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);

  // ===== v5 object-style useQuery (fixed) =====
  const {
    data: users = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["verified-agents"],
    queryFn: fetchVerifiedAgents,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 5,
  });

  // Map API users to the UI-friendly agent objects
  const topAgents = users.map((u) => ({
    id: u._id,
    name: u.name,
    title: u.title ?? "Real Estate Agent",
    photo: u.avatar ?? "",
    rating: typeof u.rating === "number" ? u.rating : 4.8,
    reviewCount: u.reviewCount ?? 0,
    salesCount: u.salesCount ?? 0,
    specialties: u.specialties ?? ["Expert"],
    location: u.location ?? "",
    phone: u.phone ?? "",
    email: u.email ?? "",
    bio:
      u.bio ??
      `Experienced agent with a strong track record. Contact at ${
        u.email || "—"
      }.`,
    achievements: u.achievements ?? ["Trusted Agent"],
  }));

  // Reset slide when data changes (e.g., new fetch or smaller set)
  useEffect(() => {
    if (topAgents.length === 0) {
      setCurrentSlide(0);
    } else if (currentSlide >= topAgents.length) {
      setCurrentSlide(0);
    }
  }, [topAgents.length, currentSlide]);

  const nextSlide = () => {
    if (topAgents.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % topAgents.length);
  };

  const prevSlide = () => {
    if (topAgents.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + topAgents.length) % topAgents.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon
          key={i}
          name="Star"
          size={16}
          className="text-warning"
          fill="currentColor"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon
          key="half"
          name="Star"
          size={16}
          className="text-warning"
          fill="currentColor"
        />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Icon
          key={`empty-${i}`}
          name="Star"
          size={16}
          className="text-secondary-300"
        />
      );
    }

    return stars;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-background">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl text-text-primary font-heading">
              Meet Our Top Agents
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-text-secondary">
              Work with industry-leading professionals who are committed to
              helping you achieve your goals
            </p>
          </div>

          <div className="space-y-4">
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-16 lg:py-24 bg-background">
        <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-text-primary">
            Meet Our Top Agents
          </h2>
          <p className="mb-6 text-text-secondary">Failed to load agents.</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 font-medium text-white rounded-md bg-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center lg:mb-16">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl text-text-primary font-heading">
            Meet Our Top Agents
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-text-secondary">
            Work with industry-leading professionals who are committed to
            helping you achieve your real estate goals
          </p>
        </div>

        {/* Agent Carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={carouselRef}>
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {topAgents.length === 0 ? (
                <div className="w-full">
                  <div className="p-8 text-center bg-white rounded-lg shadow">
                    No agents found.
                  </div>
                </div>
              ) : (
                topAgents.map((agent) => (
                  <div key={agent.id} className="flex-shrink-0 w-full">
                    <div className="max-w-4xl mx-auto">
                      <div className="overflow-hidden rounded-lg bg-surface">
                        <div className="md:flex">
                          {/* Agent Photo */}
                          <div className="md:w-1/3">
                            <div className="relative h-64 md:h-full">
                              <Image
                                src={agent.photo}
                                alt={agent.name}
                                className="object-cover w-full h-full"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                          </div>

                          {/* Agent Details */}
                          <div className="p-6 md:w-2/3 lg:p-8">
                            <div className="flex flex-col h-full">
                              {/* Header */}
                              <div className="mb-4">
                                <h3 className="mb-1 text-2xl font-bold text-text-primary">
                                  {agent.name}
                                </h3>
                                <p className="mb-2 font-medium text-primary">
                                  {agent.title}
                                </p>
                                {agent.location && (
                                  <p className="flex items-center text-text-secondary">
                                    <Icon
                                      name="MapPin"
                                      size={16}
                                      className="mr-1"
                                    />
                                    {agent.location}
                                  </p>
                                )}
                              </div>

                              {/* Rating & Stats */}
                              <div className="flex flex-wrap items-center gap-4 mb-4">
                                <div className="flex items-center space-x-1">
                                  {renderStars(agent.rating)}
                                  <span className="ml-2 text-sm text-text-secondary">
                                    {agent.rating} ({agent.reviewCount} reviews)
                                  </span>
                                </div>
                                <div className="text-sm text-text-secondary">
                                  <span className="font-semibold text-text-primary">
                                    {agent.salesCount}
                                  </span>{" "}
                                  sales
                                </div>
                              </div>

                              {/* Specialties */}
                              <div className="mb-4">
                                <p className="mb-2 text-sm font-medium text-text-primary">
                                  Specialties:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {agent.specialties.map((specialty) => (
                                    <span
                                      key={specialty}
                                      className="px-3 py-1 text-xs rounded-full bg-primary-100 text-primary"
                                    >
                                      {specialty}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Bio */}
                              <div className="flex-grow mb-6">
                                <p className="leading-relaxed text-text-secondary">
                                  {agent.bio}
                                </p>
                              </div>

                              {/* Achievements */}
                              <div className="mb-6">
                                <p className="mb-2 text-sm font-medium text-text-primary">
                                  Achievements:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {agent.achievements.map((achievement) => (
                                    <span
                                      key={achievement}
                                      className="px-2 py-1 text-xs rounded bg-success-100 text-success"
                                    >
                                      <Icon
                                        name="Award"
                                        size={12}
                                        className="inline mr-1"
                                      />
                                      {achievement}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Contact Actions */}
                              <div className="flex flex-col gap-3 sm:flex-row">
                                <button className="flex-1 px-4 py-2 font-medium text-white rounded-md bg-primary hover:bg-primary-700">
                                  <Icon
                                    name="MessageCircle"
                                    size={16}
                                    className="inline mr-2"
                                  />
                                  Contact Agent
                                </button>
                                <a
                                  href={`tel:${agent.phone || ""}`}
                                  className="inline-flex items-center justify-center flex-1 px-4 py-2 font-medium rounded-md bg-accent-100 text-accent-600 hover:bg-accent-500 hover:text-white"
                                >
                                  <Icon
                                    name="Phone"
                                    size={16}
                                    className="inline mr-2"
                                  />
                                  {agent.phone ? "Call Now" : "View Details"}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Navigation Arrows */}
          {topAgents.length > 0 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute flex items-center justify-center w-12 h-12 transition-all duration-200 ease-out transform -translate-y-1/2 rounded-full left-4 top-1/2 bg-surface shadow-elevation-2 hover:bg-secondary-100"
                aria-label="Previous agent"
              >
                <Icon
                  name="ChevronLeft"
                  size={24}
                  className="text-text-primary"
                />
              </button>

              <button
                onClick={nextSlide}
                className="absolute flex items-center justify-center w-12 h-12 transition-all duration-200 ease-out transform -translate-y-1/2 rounded-full right-4 top-1/2 bg-surface shadow-elevation-2 hover:bg-secondary-100"
                aria-label="Next agent"
              >
                <Icon
                  name="ChevronRight"
                  size={24}
                  className="text-text-primary"
                />
              </button>
            </>
          )}

          {/* Slide Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {topAgents.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? "bg-primary scale-110"
                    : "bg-secondary-300 hover:bg-secondary-400"
                }`}
                aria-label={`Go to agent ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* View All Agents Button */}
        <div className="mt-12 text-center">
          <Link
            to="/all-agents"
            className="inline-flex items-center px-8 py-3 font-semibold rounded-md bg-secondary-100 text-text-primary hover:bg-secondary-200 focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
          >
            View All Agents
            <Icon name="ArrowRight" size={20} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AgentSpotlight;
