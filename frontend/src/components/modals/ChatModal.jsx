import React, { useState, useEffect } from "react";
import GroupChat from "../GroupChat";
import api from "../../api";

export default function ChatModal({ projectId, projectTitle, onClose }) {
  const [chatGroupId, setChatGroupId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get or create chat group for this project
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        // Try to get existing chat group or create new one
        const response = await api.post(`/chat/group/init`, {
          projectId: projectId,
          groupName: `${projectTitle} Team Chat`,
        });
        setChatGroupId(response.data._id || response.data.groupId);
      } catch (err) {
        console.error("Failed to initialize chat:", err);
        // For now, use projectId as fallback chat group ID
        setChatGroupId(`project-${projectId}`);
        setError("Using local chat (not persisted)");
      } finally {
        setLoading(false);
      }
    };
    initializeChat();
  }, [projectId, projectTitle]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg">
          <p className="text-gray-700">Initializing chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-500 to-purple-500">
          <div>
            <h2 className="text-2xl font-bold text-white">💬 Project Chat</h2>
            <p className="text-blue-100 text-sm">{projectTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            ✕ Close
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-yellow-100 text-yellow-700 border-l-4 border-yellow-500 text-sm">
            {error}
          </div>
        )}

        {/* Chat component */}
        <div className="flex-1 overflow-hidden">
          {chatGroupId ? (
            <GroupChat groupId={chatGroupId} isModal={true} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Failed to load chat. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
