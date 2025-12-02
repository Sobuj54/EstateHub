import React, { useState } from "react";
import SearchInterface from "../../../components/ui/SearchInterface";
import Image from "../../../components/AppImage";

const HeroSection = ({ onSearch }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      alt: "Modern luxury home exterior",
    },
    {
      url: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=2070&q=80",
      alt: "Beautiful residential neighborhood",
    },
    {
      url: "https://images.pixabay.com/photo/2016/06/24/10/47/house-1477041_1280.jpg?auto=compress&cs=tinysrgb&w=2070&q=80",
      alt: "Contemporary home with garden",
    },
  ];

  return (
    <section className="relative h-[500px] sm:h-[550px] md:h-[700px] lg:h-[800px] overflow-hidden pt-16 md:pt-0">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image.url}
              alt={image.alt}
              className="object-cover w-full h-full"
            />
          </div>
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center h-full">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-4 text-center text-white sm:mb-6 md:mb-8 lg:mb-12">
            <h1 className="mb-2 text-2xl font-bold sm:text-3xl md:text-5xl lg:text-6xl sm:mb-3 md:mb-4 lg:mb-6 font-heading">
              Find Your Dream Home
            </h1>
            <p className="max-w-xs mx-auto mb-4 text-xs sm:text-sm md:text-lg lg:text-xl text-white/90 sm:max-w-md md:max-w-3xl sm:mb-6 md:mb-8">
              Discover the perfect property from thousands of listings across
              the country. Your next home is just a search away.
            </p>
          </div>

          {/* Search Interface */}
          <div className="max-w-full px-2 mx-auto sm:max-w-lg md:max-w-4xl">
            <SearchInterface variant="hero" onSearch={onSearch} />
          </div>

          {/* Quick Search Tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-4 sm:gap-3 sm:mt-6 md:mt-8">
            {[
              "Apartments in NYC",
              "Houses under $500K",
              "Luxury Condos",
              "Pet-Friendly Rentals",
              "Waterfront Properties",
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => onSearch({ query: tag })}
                className="px-3 py-1 text-xs text-white transition-all duration-200 ease-out border rounded-full sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm sm:text-sm hover:bg-white/30 micro-interaction border-white/30"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute z-20 flex space-x-2 transform -translate-x-1/2 bottom-4 sm:bottom-6 left-1/2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide
                ? "bg-white scale-110"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
