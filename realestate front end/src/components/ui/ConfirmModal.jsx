import React from "react";

const ConfirmModal = ({ open, title, description, onCancel, onConfirm }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-modal bg-opacity-40">
      <div className="w-full max-w-md p-6 bg-white shadow rounded-2xl">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="mt-2 text-text-secondary">{description}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white rounded bg-error"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
