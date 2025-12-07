import Icon from "components/AppIcon";

const AgentDetailsModal = ({ agent, type, onClose }) => {
  if (!agent) return null;

  const getTitle = () => {
    switch (type) {
      case "message":
        return `New Message to ${agent.name}`;
      case "email":
        return `Compose Email to ${agent.name}`;
      case "profile":
        return `Agent Profile: ${agent.name}`;
      default:
        return "Agent Details";
    }
  };

  const getContent = () => {
    switch (type) {
      case "message":
        return (
          // --- Message Form ---
          <form className="space-y-4">
            <div>
              <label
                htmlFor="messageSubject"
                className="block text-sm font-medium text-gray-700"
              >
                Subject
              </label>
              <input
                type="text"
                id="messageSubject"
                defaultValue={`Inquiry about your services - ${new Date().toLocaleDateString()}`}
                className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="messageBody"
                className="block text-sm font-medium text-gray-700"
              >
                Message
              </label>
              <textarea
                id="messageBody"
                rows="4"
                className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Enter your message here..."
                required
              />
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button
                type="submit"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Message to ${agent.name} sent! (Simulated)`);
                  onClose();
                }}
              >
                Send Message
              </button>
            </div>
          </form>
        );

      case "email":
        return (
          // --- Email Form ---
          <form className="space-y-4">
            <div>
              <label
                htmlFor="emailRecipient"
                className="block text-sm font-medium text-gray-700"
              >
                Recipient Email
              </label>
              <input
                type="email"
                id="emailRecipient"
                value={agent.email}
                readOnly
                className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-50"
              />
            </div>
            <div>
              <label
                htmlFor="emailSubject"
                className="block text-sm font-medium text-gray-700"
              >
                Subject
              </label>
              <input
                type="text"
                id="emailSubject"
                className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="emailBody"
                className="block text-sm font-medium text-gray-700"
              >
                Body
              </label>
              <textarea
                id="emailBody"
                rows="6"
                className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Write your email body here..."
                required
              />
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button
                type="submit"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Email to ${agent.email} sent! (Simulated)`);
                  onClose();
                }}
              >
                Send Email
              </button>
            </div>
          </form>
        );

      case "profile":
        return (
          // --- Profile View ---
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={agent.avatar || ""}
                  alt={agent.name}
                  className="object-cover w-16 h-16 bg-gray-100 rounded-full"
                />
              </div>
              <div>
                <h4 className="text-xl font-bold text-text-primary">
                  {agent.name}
                </h4>
                <p className="text-sm text-text-secondary">{agent.email}</p>
              </div>
            </div>

            <dl className="grid grid-cols-1 text-sm sm:grid-cols-2 gap-x-4 gap-y-4">
              <div className="sm:col-span-1">
                <dt className="font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 break-all text-text-primary">
                  {agent._id}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="font-medium text-gray-500">Role</dt>
                <dd className="mt-1 capitalize text-text-primary">
                  {agent.role}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="font-medium text-gray-500">Account Created</dt>
                <dd className="mt-1 text-text-primary">
                  {new Date(agent.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-text-primary">
                  {new Date(agent.updatedAt).toLocaleDateString()}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-gray-500">Version (`__v`)</dt>
                <dd className="mt-1 text-text-primary">{agent.__v}</dd>
              </div>
            </dl>
          </div>
        );
      default:
        return <p>No specific action defined.</p>;
    }
  };

  return (
    // Modal Overlay (Fixed position, full screen, responsive)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity bg-black bg-opacity-50"
      onClick={onClose}
    >
      {/* Modal Content Box (Responsive width and max-width) */}
      <div
        className="bg-white rounded-lg shadow-2xl p-6 m-4 w-full max-w-xl overflow-y-auto max-h-[90vh] transform transition-transform sm:my-8 sm:w-full"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b">
          <h3 className="text-2xl font-bold text-text-primary">{getTitle()}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <div className="text-text-secondary">{getContent()}</div>

        {/* Only show 'Close' button if the content doesn't have its own submit/close action */}
        {type !== "message" && type !== "email" && (
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 transition border rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDetailsModal;
