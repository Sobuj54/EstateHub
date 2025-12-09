import React, { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import Header from "../../components/ui/Header";
import Icon from "../../components/AppIcon";
import PropertyCard from "./components/PropertyCard";
import FilterPanel from "./components/FilterPanel";
import MapView from "./components/MapView";
import SortDropdown from "./components/SortDropdown";
import { Helmet } from "react-helmet";
import Pagination from "components/ui/Pagination";

const API_URL = import.meta.env.VITE_API;

const fetchProperties = async ({ queryKey }) => {
  const [_key, { page, limit, query }] = queryKey;
  const response = await axios.get(`${API_URL}/properties`, {
    params: {
      pageNo: page,
      limit,
      ...(query ? { query } : {}), // only include query if present
    },
  });
  return response.data.data;
};

const PropertyListings = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [sortBy, setSortBy] = useState("relevance");

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["properties", { page, limit: 10, query: searchQuery }],
    queryFn: fetchProperties,
    keepPreviousData: true,
  });

  const properties = data?.properties || [];
  const totalPages = data?.totalPage || 1;

  const sortedProperties = useMemo(() => {
    const propertiesToSort = [...properties];
    switch (sortBy) {
      case "price-low":
        return propertiesToSort.sort((a, b) => a.price - b.price);
      case "price-high":
        return propertiesToSort.sort((a, b) => b.price - a.price);
      case "size":
        return propertiesToSort.sort((a, b) => b.sqft - a.sqft);
      default:
        return propertiesToSort;
    }
  }, [properties, sortBy]);

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const handlePropertySave = (propertyId, isSaved) => {
    const queryKey = ["properties", { page, limit: 10, query: searchQuery }];
    queryClient.setQueryData(queryKey, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        properties: oldData.properties.map((property) =>
          property._id === propertyId ? { ...property, isSaved } : property
        ),
      };
    });
  };

  const getBreadcrumbs = () => [
    { label: "Home", path: "/homepage" },
    { label: "Properties", path: "/property-listings" },
  ];

  const loading = isLoading || isFetching;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 mx-4 my-12 bg-surface border border-border rounded-lg shadow-sm text-center">
        <Icon
          name="ExclamationCircle"
          size={48}
          className="mb-4 text-primary"
        />
        <h2 className="mb-2 text-2xl font-semibold text-text-primary">
          Oops! Something went wrong
        </h2>
        <p className="max-w-md mb-4 text-text-secondary">
          We couldn't fetch the property listings. This could be due to a
          network issue or a temporary server problem.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 font-medium text-white transition-all duration-200 rounded-md bg-primary hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const renderListContent = (isMobile) => {
    if (loading) {
      return (
        <div className={`grid grid-cols-1 gap-6 ${isMobile ? "gap-4" : ""}`}>
          {[...Array(6)].map((_, index) => (
            <div key={index} className="p-4 card">
              <div className="animate-pulse">
                <div className={`flex ${isMobile ? "flex-col" : "space-x-4"}`}>
                  <div
                    className={`${
                      isMobile ? "w-full h-48 mb-4" : "w-48 h-32"
                    } rounded-md bg-secondary-200`}
                  ></div>
                  <div className="flex-1 space-y-3">
                    <div className="w-3/4 h-4 rounded bg-secondary-200"></div>
                    <div className="w-1/2 h-3 rounded bg-secondary-200"></div>
                    <div className="w-2/3 h-3 rounded bg-secondary-200"></div>
                    <div className={`flex space-x-2 ${isMobile ? "mt-2" : ""}`}>
                      <div className="w-16 h-3 rounded bg-secondary-200"></div>
                      <div className="w-16 h-3 rounded bg-secondary-200"></div>
                      <div className="w-16 h-3 rounded bg-secondary-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (sortedProperties.length === 0) {
      return (
        <div className="py-12 text-center">
          <Icon
            name="Search"
            size={48}
            className="mx-auto mb-4 text-secondary"
          />
          <h3 className="mb-2 text-lg font-semibold text-text-primary">
            No properties found
          </h3>
          <p className="text-text-secondary">
            Try adjusting your search criteria or filters
          </p>
        </div>
      );
    }

    return (
      <>
        <div className={` ${isMobile ? "space-y-4" : "flex flex-col gap-4"}`}>
          {sortedProperties.map((property) => {
            return (
              <Link to={`/property-details/${property._id}`} key={property._id}>
                <PropertyCard
                  property={property}
                  variant={isMobile ? "card" : "list"}
                  onSave={handlePropertySave}
                  isHighlighted={selectedProperty?._id === property._id}
                />
              </Link>
            );
          })}
        </div>
        <div className="flex justify-center py-8">
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
      </>
    );
  };

  return (
    <>
      <Helmet>
        <title>EstateHub | Listing</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 lg:pt-18">
          {/* Breadcrumb */}
          <div className="border-b bg-surface border-border">
            <div className="px-4 py-3 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <nav className="flex items-center space-x-2 text-sm">
                {getBreadcrumbs().map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <Icon
                        name="ChevronRight"
                        size={14}
                        className="text-text-secondary"
                      />
                    )}
                    {crumb.path ? (
                      <Link
                        to={crumb.path}
                        className="transition-colors duration-200 text-text-secondary hover:text-text-primary"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="font-medium text-text-primary">
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            </div>
          </div>

          {/* Search Header */}
          <div className="border-b bg-surface border-border">
            <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">
                    Properties for Sale
                  </h1>
                  <p className="mt-1 text-text-secondary">
                    {loading
                      ? "Loading..."
                      : `${sortedProperties.length} properties found (Page ${page} of ${totalPages})`}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex p-1 rounded-md lg:hidden bg-secondary-100">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
                        viewMode === "list"
                          ? "bg-surface text-text-primary shadow-sm"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <Icon name="List" size={16} className="inline mr-1" />
                      List
                    </button>
                    <button
                      onClick={() => setViewMode("map")}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
                        viewMode === "map"
                          ? "bg-surface text-text-primary shadow-sm"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <Icon name="Map" size={16} className="inline mr-1" />
                      Map
                    </button>
                  </div>

                  <SortDropdown value={sortBy} onChange={handleSortChange} />

                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 ease-out rounded-md bg-primary hover:bg-primary-700 micro-interaction"
                  >
                    <Icon name="SlidersHorizontal" size={16} />
                    <span className="hidden sm:inline">Filters</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="mx-auto max-w-7xl">
            <div className="flex">
              <FilterPanel
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onFilterChange={() => {}}
                initialFilters={{}}
              />

              <div className="flex-1 min-w-0">
                <div className="hidden lg:flex h-[calc(100vh-200px)]">
                  <div className="w-3/5 overflow-y-auto">
                    <div className="p-6">{renderListContent(false)}</div>
                  </div>
                  <div className="w-2/5 border-l border-border">
                    <MapView
                      properties={sortedProperties}
                      selectedProperty={selectedProperty}
                      onPropertySelect={setSelectedProperty}
                    />
                  </div>
                </div>

                <div className="lg:hidden">
                  {viewMode === "list" ? (
                    <div className="p-4">{renderListContent(true)}</div>
                  ) : (
                    <div className="h-[calc(100vh-200px)]">
                      <MapView
                        properties={sortedProperties}
                        selectedProperty={selectedProperty}
                        onPropertySelect={setSelectedProperty}
                        isMobile={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PropertyListings;
