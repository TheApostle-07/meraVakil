import React from "react";

const DeleteChat = ({ onClose, handleDelete }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Delete chat?
        </h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this chat?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteChat;
