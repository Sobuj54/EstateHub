import Icon from "components/AppIcon";

const CustomModal = ({ title, children, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity bg-gray-900 bg-opacity-75"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-white/95 backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 transition-colors duration-150 rounded-full hover:bg-gray-100 hover:text-gray-800 focus:outline-none"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white transition duration-150 rounded-lg bg-primary hover:bg-primary-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
