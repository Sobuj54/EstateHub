import DetailItem from "helpers/DetailItem";
import CustomModal from "./CustomModal";
import { formatDate } from "utils/formatDate";

const AgentProfileModal = ({ agent, onClose }) => {
  if (!agent) return null;

  // Mock additional details for presentation
  const mockDetails = {
    email: agent.name.toLowerCase().replace(/\s/g, ".") + "@realty.com",
    phone: "+1 (555) 123-4567",
    joined: formatDate(
      new Date(Date.now() - 31536000000 * (agent.propertiesCount / 10))
    ), // Mock join date
    rating: (4 + (agent.propertiesCount % 5) / 10).toFixed(1),
    bio: `A dedicated professional with ${agent.propertiesCount} successful listings in the past year, specializing in luxury residential properties. Known for client satisfaction and market expertise.`,
  };

  return (
    <CustomModal
      title={`Agent Profile: ${agent.name}`}
      isOpen={!!agent}
      onClose={onClose}
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center mb-4 ">
          <img
            src={`${agent.avatar}`}
            className="object-cover w-24 h-24 rounded-full"
          />
        </div>
        <h4 className="text-xl font-bold">{agent.name}</h4>
        <p className="text-sm text-text-secondary">
          Listings: {agent.propertiesCount}
        </p>
      </div>
      <div className="mt-6 space-y-3">
        <DetailItem label="Email" value={mockDetails.email} icon="Mail" />
        <DetailItem label="Phone" value={mockDetails.phone} icon="Phone" />
        <DetailItem label="Joined" value={mockDetails.joined} icon="Calendar" />
        <DetailItem
          label="Rating"
          value={`${mockDetails.rating} / 5.0`}
          icon="Star"
        />
      </div>
      <div className="p-4 mt-6 rounded-lg bg-gray-50">
        <h4 className="mb-2 text-base font-semibold">Bio</h4>
        <p className="text-sm text-text-secondary">{mockDetails.bio}</p>
      </div>
    </CustomModal>
  );
};

export default AgentProfileModal;
