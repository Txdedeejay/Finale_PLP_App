import React, { useState, useEffect } from "react";
import api from "../../api";

export default function InviteTeamModal({ projectId, projectTitle, onClose, onInviteSent }) {
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load available volunteers from backend
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        setLoading(true);
        // You'll create this endpoint on backend
        const response = await api.get("/volunteers");
        setVolunteers(response.data || []);
      } catch (err) {
        console.error("Failed to load volunteers:", err);
        // Mock data for now
        setVolunteers([
          { _id: "1", name: "John Doe", email: "john@example.com", skills: ["Teaching", "Leadership"] },
          { _id: "2", name: "Jane Smith", email: "jane@example.com", skills: ["Writing", "Design"] },
          { _id: "3", name: "Bob Johnson", email: "bob@example.com", skills: ["Coding", "Data Analysis"] },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchVolunteers();
  }, []);

  const handleSendInvite = async () => {
    if (!selectedVolunteer) {
      setError("Please select a volunteer");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const volunteer = volunteers.find((v) => v._id === selectedVolunteer);
      
      // Call backend to send invite
      await api.post(`/projects/${projectId}/invite`, {
        volunteerId: selectedVolunteer,
        volunteerEmail: volunteer.email,
        message: message || `You've been invited to join the project: ${projectTitle}`,
      });

      setSuccess(`✓ Invite sent to ${volunteer.name}!`);
      setSelectedVolunteer("");
      setMessage("");

      // Call parent callback if provided
      if (onInviteSent) {
        onInviteSent();
      }

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to send invite:", err);
      setError("Failed to send invite. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">👥 Invite Team Members</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            ✕ Close
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-sm">
            Invite volunteers to join <span className="font-semibold">{projectTitle}</span>
          </p>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg border-l-4 border-red-500">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 text-green-700 rounded-lg border-l-4 border-green-500">
              {success}
            </div>
          )}

          {/* Volunteer selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Volunteer
            </label>
            <select
              value={selectedVolunteer}
              onChange={(e) => setSelectedVolunteer(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Choose a volunteer --</option>
              {volunteers.map((vol) => (
                <option key={vol._id} value={vol._id}>
                  {vol.name} ({vol.email})
                </option>
              ))}
            </select>
          </div>

          {/* Selected volunteer info */}
          {selectedVolunteer && (
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
              {volunteers.find((v) => v._id === selectedVolunteer) && (
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {volunteers.find((v) => v._id === selectedVolunteer).name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Skills:{" "}
                    {volunteers.find((v) => v._id === selectedVolunteer).skills.join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Custom message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Custom Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message to the invitation..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows="3"
              disabled={loading}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSendInvite}
              disabled={loading || !selectedVolunteer}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 transition font-semibold"
            >
              {loading ? "Sending..." : "📨 Send Invite"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
