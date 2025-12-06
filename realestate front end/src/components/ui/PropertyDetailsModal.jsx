import DetailItem from "helpers/DetailItem";
import CustomModal from "./CustomModal";
import { formatDate } from "utils/formatDate";

const PropertyDetailModal = ({ property, onClose }) => {
  if (!property) return null;

  // Mock additional details for presentation
  const mockDetails = {
    price: "450,000",
    type: property.title.includes("Villa")
      ? "Residential / Villa"
      : "Residential / Apartment",
    location: "123 Main St, Anytown, CA",
    status: "Active",
    rooms: 4,
    area: "2,100 sq ft",
  };

  return (
    <CustomModal
      title={`Details for: ${property.title}`}
      isOpen={!!property}
      onClose={onClose}
    >
      <div className="grid grid-cols-2 gap-4 text-sm">
        <DetailItem label="Price" value={`$${mockDetails.price}`} />
        <DetailItem label="Property Type" value={mockDetails.type} />
        <DetailItem
          label="Agent"
          value={property.agent?.name || "Unassigned"}
        />
        <DetailItem label="Status" value={mockDetails.status} />
        <DetailItem label="Rooms" value={mockDetails.rooms} />
        <DetailItem label="Area" value={mockDetails.area} />
        <DetailItem
          label="Listing Date"
          value={formatDate(property.createdAt)}
        />
      </div>
      <div className="mt-6">
        <h4 className="mb-2 text-base font-semibold">Location</h4>
        <p className="text-text-secondary">{mockDetails.location}</p>
      </div>
    </CustomModal>
  );
};

export default PropertyDetailModal;
