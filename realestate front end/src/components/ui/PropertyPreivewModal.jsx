import React from "react";

const PropertyPreviewModal = ({ open, property, onClose }) => {
  if (!open || !property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 w-11/12 max-w-2xl overflow-auto max-h-[90vh]">
        <h2 className="mb-2 text-xl font-bold">{property.title}</h2>
        <p className="mb-4 text-sm text-gray-600">
          By {property.agent?.name} ·{" "}
          {property.isApproved ? "Approved" : "Pending"}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4 sm:grid-cols-3">
          {property.images?.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={property.title}
              className="object-cover w-full h-24 rounded"
            />
          ))}
        </div>

        <p className="mb-2">
          <strong>Price:</strong> ${property.price?.toLocaleString()}
        </p>
        <p className="mb-2">
          <strong>Address:</strong> {property.address}
        </p>
        <p className="mb-2">
          <strong>Bedrooms:</strong> {property.bedrooms} ·{" "}
          <strong>Bathrooms:</strong> {property.bathrooms} ·{" "}
          <strong>Sqft:</strong> {property.sqft}
        </p>
        <p className="mb-2">
          <strong>Type:</strong> {property.propertyType}
        </p>
        <p className="mb-2">
          <strong>Amenities:</strong> {property.amenities?.join(", ")}
        </p>
        <p className="mb-2">
          <strong>Description:</strong> {property.description}
        </p>

        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyPreviewModal;
