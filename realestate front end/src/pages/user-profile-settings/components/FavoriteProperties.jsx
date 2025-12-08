// src/pages/user-profile-settings/components/FavoriteProperties.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Icon from "../../../components/AppIcon";
import useAuthContext from "hooks/useAuthContext";
import Pagination from "components/ui/Pagination";
import { toast } from "react-toastify";
import useAxiosSecure from "hooks/useAxiosSecure";

const DefaultPageSize = 10;

const getStatusBadge = (status) => {
  switch (status) {
    case "active":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success">
          Active
        </span>
      );
    case "price_drop":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning-100 text-warning">
          Price Drop
        </span>
      );
    case "sold":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary-100 text-text-secondary">
          Sold
        </span>
      );
    default:
      return null;
  }
};

const LoadingSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="overflow-hidden border rounded-lg border-border animate-pulse"
      >
        <div className="w-full h-48 bg-secondary-100" />
        <div className="p-4 space-y-2">
          <div className="w-3/4 h-5 rounded bg-secondary-100" />
          <div className="w-1/2 h-4 rounded bg-secondary-100" />
          <div className="w-full h-8 mt-2 rounded bg-secondary-100" />
        </div>
      </div>
    ))}
  </div>
);

const transformApiItem = (item) => {
  // item is savedProperties entry: { _id, propertyId: {...}, createdAt }
  const prop = item.propertyId || {};
  return {
    savedId: item._id,
    id: prop._id,
    title: prop.title,
    address: prop.address,
    price: prop.price,
    beds: prop.bedrooms,
    baths: prop.bathrooms,
    sqft: prop.sqft,
    images: prop.images || [],
    dateAdded: item.createdAt,
    status: prop.isApproved ? "active" : "active", // fallback; adapt if API has status
    listingAgent: prop.agent?.name,
    lastPriceChange: null,
    raw: item,
  };
};

const FavoriteProperties = ({ onDataChange }) => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // UI state
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sortBy, setSortBy] = useState("dateAdded");
  const [filterBy, setFilterBy] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DefaultPageSize);

  // Query key
  const queryKey = ["saved-properties", { page, limit }];

  // Redirect if user not logged in? Here we simply show empty state and a message
  // The API will also require a user token; useAxiosSecure handles that.
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      // server expects query params: limit, pageNo
      const res = await axiosSecure.get("/saved-properties", {
        params: { limit, pageNo: page },
      });

      const payload = res?.data?.data ?? {};
      const saved = payload.savedProperties ?? [];
      return {
        savedProperties: saved,
        totalPages: payload.totalPages ?? 1,
        currentPage: payload.currentPage ?? page,
        totalCount: payload.totalCount ?? saved.length,
      };
    },
    keepPreviousData: true,
    staleTime: 1000 * 30,
    enabled: !!user, // only fetch when user exists
  });

  // Derived lists
  const savedProperties = data?.savedProperties ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;
  const currentPageFromServer = data?.currentPage ?? page;

  // Map API shape to UI shape
  const items = useMemo(
    () => savedProperties.map(transformApiItem),
    [savedProperties]
  );

  // Sync page if server forces different page
  useEffect(() => {
    if (
      typeof currentPageFromServer === "number" &&
      currentPageFromServer !== page &&
      currentPageFromServer >= 1 &&
      currentPageFromServer <= totalPages
    ) {
      setPage(currentPageFromServer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageFromServer, totalPages]);

  // Delete single saved item mutation: DELETE /saved-properties/:id
  const deleteMutation = useMutation({
    mutationFn: async (savedId) => {
      const res = await axiosSecure.delete(`/saved-properties/${savedId}`);
      return res.data;
    },
    onMutate: async (savedId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          savedProperties: old.savedProperties.filter((s) => s._id !== savedId),
          totalCount: Math.max(0, (old.totalCount ?? 1) - 1),
        };
      });
      return { previous };
    },
    onError: (err, vars, context) => {
      toast.error(
        err?.response?.data?.message || "Failed to remove saved property"
      );
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSuccess: () => {
      toast.success("Removed from favorites");
      queryClient.invalidateQueries({ queryKey });
      onDataChange?.();
    },
  });

  // Bulk remove using Promise.all (calls delete endpoint per id)
  const handleBulkRemove = async () => {
    if (selectedProperties.length === 0) return;
    if (!window.confirm(`Remove ${selectedProperties.length} properties?`)) {
      return;
    }

    try {
      // Use Promise.all for parallel deletes
      await Promise.all(
        selectedProperties.map((savedId) =>
          axiosSecure.delete(`/saved-properties/${savedId}`)
        )
      );
      toast.success("Selected properties removed");
      setSelectedProperties([]);
      queryClient.invalidateQueries({ queryKey });
      onDataChange?.();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to remove selected properties"
      );
      queryClient.invalidateQueries({ queryKey });
    }
  };

  // Handlers for selection
  const handleSelectProperty = (savedId) => {
    setSelectedProperties((prev) =>
      prev.includes(savedId)
        ? prev.filter((id) => id !== savedId)
        : [...prev, savedId]
    );
  };

  const handleSelectAll = () => {
    const filtered = getFilteredSortedItems();
    if (selectedProperties.length === filtered.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(filtered.map((p) => p.savedId));
    }
  };

  // UI actions
  const handleRemoveFavorite = (savedId) => {
    if (!window.confirm("Remove this property from your favorites?")) return;
    deleteMutation.mutate(savedId);
    setSelectedProperties((prev) => prev.filter((id) => id !== savedId));
  };

  const handleShare = () => {
    if (selectedProperties.length === 0) {
      toast.info("Please select properties to share.");
      return;
    }
    setShowShareModal(true);
  };

  // Filtering + sorting on client (server-side could be added later)
  const getFilteredSortedItems = () => {
    let filtered = items;

    if (filterBy !== "all") {
      filtered = filtered.filter((p) => p.status === filterBy);
    }

    const sorted = filtered.slice().sort((a, b) => {
      switch (sortBy) {
        case "dateAdded":
          return new Date(b.dateAdded) - new Date(a.dateAdded);
        case "price":
          return (b.price || 0) - (a.price || 0);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  };

  const filteredProperties = getFilteredSortedItems();

  // If user not logged in show a small message / CTA to login
  if (!user) {
    return (
      <div className="p-6 rounded-lg bg-surface shadow-elevation-1">
        <div className="py-12 text-center">
          <Icon
            name="Heart"
            size={48}
            className="mx-auto mb-4 text-secondary-300"
          />
          <h3 className="mb-2 text-lg font-medium text-text-primary">
            No saved properties (login required)
          </h3>
          <p className="mb-4 text-text-secondary">
            Please log in to see your saved properties.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-surface shadow-elevation-1">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary font-heading">
              Favorite Properties
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {totalCount} saved properties
              {isFetching && (
                <span className="ml-2 text-xs text-blue-500">Updating…</span>
              )}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col mt-4 space-y-2 md:mt-0 sm:flex-row sm:space-y-0 sm:space-x-3">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 text-sm transition-all duration-200 border rounded-md border-border focus:border-border-focus focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Properties</option>
              <option value="active">Active Only</option>
              <option value="price_drop">Price Drops</option>
              <option value="sold">Sold</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-sm transition-all duration-200 border rounded-md border-border focus:border-border-focus focus:ring-2 focus:ring-primary-500"
            >
              <option value="dateAdded">Date Added</option>
              <option value="price">Price</option>
              <option value="title">Name</option>
            </select>
          </div>

          {/* Bulk Actions */}
        </div>

        {selectedProperties.length > 0 && (
          <div className="flex items-center justify-between p-3 mt-4 rounded-lg bg-primary-100">
            <span className="text-sm font-medium text-primary">
              {selectedProperties.length} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleShare}
                className="text-sm font-medium transition-colors duration-200 text-primary hover:text-primary-700"
              >
                Share
              </button>
              <button
                onClick={handleBulkRemove}
                className="text-sm font-medium transition-colors duration-200 text-error hover:text-error-600"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {isLoading ? (
          <LoadingSkeleton count={4} />
        ) : isError ? (
          <div className="py-8 text-center">
            <p className="text-text-secondary">
              Failed to load saved properties.
            </p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="py-8 text-center">
            <Icon
              name="Heart"
              size={48}
              className="mx-auto mb-4 text-secondary-300"
            />
            <h3 className="mb-2 text-lg font-medium text-text-primary">
              {savedProperties.length === 0
                ? "No Favorite Properties"
                : "No Properties Match Filter"}
            </h3>
            <p className="text-text-secondary">
              {savedProperties.length === 0
                ? "Start browsing properties and save your favorites here."
                : "Try adjusting your filter settings to see more properties."}
            </p>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center mb-4 space-x-2">
              <input
                type="checkbox"
                id="selectAll"
                checked={
                  selectedProperties.length === filteredProperties.length &&
                  filteredProperties.length > 0
                }
                onChange={handleSelectAll}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
              />
              <label
                htmlFor="selectAll"
                className="text-sm font-medium text-text-primary"
              >
                Select All
              </label>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="overflow-hidden transition-shadow duration-200 border rounded-lg border-border hover:shadow-elevation-2"
                >
                  <div className="relative">
                    <img
                      src={
                        property.images?.[0] || "/assets/images/no_image.png"
                      }
                      alt={property.title}
                      className="object-cover w-full h-48"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/images/no_image.png";
                      }}
                    />

                    {/* Checkbox Overlay */}
                    <div className="absolute top-3 left-3">
                      <input
                        type="checkbox"
                        checked={selectedProperties.includes(property.savedId)}
                        onChange={() => handleSelectProperty(property.savedId)}
                        className="w-4 h-4 bg-white border-white rounded text-primary focus:ring-primary bg-opacity-90"
                      />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(property.status)}
                    </div>

                    {/* Price Change Badge */}
                    {property.lastPriceChange && (
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-1 text-xs font-medium text-white rounded bg-warning">
                          {property.lastPriceChange}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-medium text-text-primary">
                        {property.title}
                      </h3>
                      <button
                        onClick={() => handleRemoveFavorite(property.savedId)}
                        className="p-1 transition-colors duration-200 rounded text-error hover:bg-error-100"
                        title="Remove from favorites"
                      >
                        <Icon name="Heart" size={20} className="fill-current" />
                      </button>
                    </div>

                    <p className="mb-2 text-sm text-text-secondary">
                      {property.address}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-primary">
                        ${property.price?.toLocaleString?.() ?? property.price}
                      </span>
                      <div className="flex items-center space-x-4 text-sm text-text-secondary">
                        <span>{property.beds} bed</span>
                        <span>{property.baths} bath</span>
                        <span>{property.sqft?.toLocaleString?.()} sqft</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-text-secondary">
                      <span>Agent: {property.listingAgent}</span>
                      <span>
                        Added: {new Date(property.dateAdded).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center mt-6">
              <Pagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-modal">
          <div className="w-full max-w-md p-6 rounded-lg shadow-xl bg-surface">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Share Properties
            </h3>

            <p className="mb-4 text-text-secondary">
              Share {selectedProperties.length} selected properties via:
            </p>

            <div className="space-y-3">
              <button className="flex items-center w-full p-3 space-x-3 transition-colors duration-200 border rounded-lg border-border hover:bg-secondary-100">
                <Icon name="Mail" size={20} className="text-primary" />
                <span>Email</span>
              </button>
              <button
                onClick={() => {
                  const urls = filteredProperties
                    .filter((p) => selectedProperties.includes(p.savedId))
                    .map((p) => window.location.origin + "/property/" + p.id)
                    .join("\n");
                  navigator.clipboard.writeText(urls);
                  toast.success("Links copied to clipboard");
                }}
                className="flex items-center w-full p-3 space-x-3 transition-colors duration-200 border rounded-lg border-border hover:bg-secondary-100"
              >
                <Icon name="Share" size={20} className="text-primary" />
                <span>Copy Link</span>
              </button>
              <button className="flex items-center w-full p-3 space-x-3 transition-colors duration-200 border rounded-lg border-border hover:bg-secondary-100">
                <Icon name="Download" size={20} className="text-primary" />
                <span>Export as PDF</span>
              </button>
            </div>

            <div className="flex mt-6 space-x-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 font-medium transition-colors duration-200 border rounded-md border-border text-text-secondary hover:bg-secondary-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoriteProperties;
