import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Image from "../../../components/AppImage";
import women1 from "/assets/images/women-1.avif";
import women2 from "/assets/images/women-2.avif";
import women3 from "/assets/images/women-3.avif";
import women4 from "/assets/images/women-4.avif";

const AgentSpotlight = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);

  const topAgents = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Senior Real Estate Agent",
      photo: `${women1}`,
      rating: 4.9,
      reviewCount: 127,
      salesCount: 89,
      specialties: ["Luxury Homes", "First-Time Buyers"],
      location: "Manhattan, NY",
      phone: "+1 (555) 123-4567",
      email: "sarah.johnson@estatehub.com",
      bio: `Sarah has been helping families find their dream homes in Manhattan for over 8 years. Her expertise in luxury properties and dedication to client satisfaction has earned her numerous industry awards.`,
      achievements: [
        "Top 1% Agent 2023",
        "Customer Choice Award",
        "Luxury Specialist",
      ],
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "Real Estate Specialist",
      photo: `${women2}`,
      rating: 4.8,
      reviewCount: 94,
      salesCount: 67,
      specialties: ["Investment Properties", "Commercial Real Estate"],
      location: "Austin, TX",
      phone: "+1 (555) 234-5678",
      email: "michael.chen@estatehub.com",
      bio: `Michael specializes in investment properties and has helped countless clients build their real estate portfolios. His analytical approach and market knowledge make him a trusted advisor.`,
      achievements: [
        "Investment Expert 2023",
        "Rising Star Award",
        "Market Analyst",
      ],
    },
    {
      id: 3,
      name: "Elena Rodriguez",
      title: "Luxury Property Consultant",
      photo: `${women3}`,
      rating: 5.0,
      reviewCount: 156,
      salesCount: 112,
      specialties: ["Waterfront Properties", "Luxury Condos"],
      location: "Miami, FL",
      phone: "+1 (555) 345-6789",
      email: "elena.rodriguez@estatehub.com",
      bio: `Elena is Miami's premier luxury property consultant, specializing in waterfront estates and high-end condominiums. Her bilingual skills and cultural expertise serve diverse clientele.`,
      achievements: [
        "Luxury Leader 2023",
        "Multilingual Expert",
        "Waterfront Specialist",
      ],
    },
    {
      id: 4,
      name: "David Kim",
      title: "Residential Sales Expert",
      photo: `${women4}`,
      rating: 4.7,
      reviewCount: 83,
      salesCount: 54,
      specialties: ["Family Homes", "Eco-Friendly Properties"],
      location: "Portland, OR",
      phone: "+1 (555) 456-7890",
      email: "david.kim@estatehub.com",
      bio: `David focuses on sustainable and family-friendly properties in Portland. His commitment to environmental responsibility and community values resonates with eco-conscious buyers.`,
      achievements: [
        "Green Building Expert",
        "Family Advocate",
        "Community Leader",
      ],
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % topAgents.length);
  };

  const prevSlide = () => {
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
              {topAgents.map((agent) => (
                <div key={agent.id} className="flex-shrink-0 w-full">
                  <div className="max-w-4xl mx-auto">
                    <div className="overflow-hidden rounded-lg bg-surface shadow-elevation-2">
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
                              <p className="flex items-center text-text-secondary">
                                <Icon
                                  name="MapPin"
                                  size={16}
                                  className="mr-1"
                                />
                                {agent.location}
                              </p>
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
                              <button className="flex-1 px-4 py-2 font-medium text-white transition-all duration-200 ease-out rounded-md bg-primary hover:bg-primary-700 micro-interaction">
                                <Icon
                                  name="MessageCircle"
                                  size={16}
                                  className="inline mr-2"
                                />
                                Contact Agent
                              </button>
                              <button className="flex-1 px-4 py-2 font-medium transition-all duration-200 ease-out rounded-md bg-accent-100 text-accent-600 hover:bg-accent-500 hover:text-white micro-interaction">
                                <Icon
                                  name="Phone"
                                  size={16}
                                  className="inline mr-2"
                                />
                                Call Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute flex items-center justify-center w-12 h-12 transition-all duration-200 ease-out transform -translate-y-1/2 rounded-full left-4 top-1/2 bg-surface shadow-elevation-2 hover:bg-secondary-100 micro-interaction"
            aria-label="Previous agent"
          >
            <Icon name="ChevronLeft" size={24} className="text-text-primary" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute flex items-center justify-center w-12 h-12 transition-all duration-200 ease-out transform -translate-y-1/2 rounded-full right-4 top-1/2 bg-surface shadow-elevation-2 hover:bg-secondary-100 micro-interaction"
            aria-label="Next agent"
          >
            <Icon name="ChevronRight" size={24} className="text-text-primary" />
          </button>

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
            to="/agent-dashboard"
            className="inline-flex items-center px-8 py-3 font-semibold transition-all duration-200 ease-out rounded-md bg-secondary-100 text-text-primary hover:bg-secondary-200 focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 micro-interaction"
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
