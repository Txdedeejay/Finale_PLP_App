import React, { useState } from "react";
import BrainstormCanvas from "./BrainstormCanvas";
import NotesModal from "./modals/NotesModal";
import InviteTeamModal from "./modals/InviteTeamModal";
import ChatModal from "./modals/ChatModal";

export default function ProjectWorkspace({ project, onClose }) {
  const [showNotes, setShowNotes] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showChat, setShowChat] = useState(false);

  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full h-[90vh] max-w-6xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{project.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-lg"
          >
            ✕ Close
          </button>
        </div>

        {/* Main workspace */}
        <div className="flex flex-1 gap-6 p-6 overflow-hidden">
          {/* Canvas (main area) */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">💡 Brainstorming Canvas</h3>
            <BrainstormCanvas />
          </div>

          {/* Project details sidebar */}
          <div className="w-64 bg-gray-50 rounded-lg p-4 overflow-y-auto border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Project Details</h3>

            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                <p className="text-sm text-gray-700 mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      project.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {project.status}
                  </span>
                </p>
              </div>

              {/* Progress */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Progress</label>
                <div className="mt-1 w-full bg-gray-300 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{project.progress}%</p>
              </div>

              {/* Volunteers */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Team Members</label>
                <p className="text-sm text-gray-700 mt-1">👥 {project.volunteers} volunteers</p>
              </div>

              {/* Budget */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Budget</label>
                <p className="text-sm text-gray-700 mt-1">💰 ${project.budget}</p>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                <p className="text-sm text-gray-700 mt-1">📂 {project.category}</p>
              </div>

              {/* Created By */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Created By</label>
                <p className="text-sm text-gray-700 mt-1">👤 {project.createdBy}</p>
              </div>

              {/* Deadline */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Deadline</label>
                <p className="text-sm text-gray-700 mt-1">📅 {project.deadline}</p>
              </div>

              {/* Quick actions */}
              <div className="mt-6 pt-4 border-t space-y-2">
                <button
                  onClick={() => setShowNotes(true)}
                  className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                >
                  📝 Add Notes
                </button>
                <button
                  onClick={() => setShowInvite(true)}
                  className="w-full px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm"
                >
                  👥 Invite Team
                </button>
                <button
                  onClick={() => setShowChat(true)}
                  className="w-full px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
                >
                  💬 Open Chat
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showNotes && (
          <NotesModal
            projectId={project._id || "demo-project"}
            onClose={() => setShowNotes(false)}
          />
        )}
        {showInvite && (
          <InviteTeamModal
            projectId={project._id || "demo-project"}
            projectTitle={project.title}
            onClose={() => setShowInvite(false)}
          />
        )}
        {showChat && (
          <ChatModal
            projectId={project._id || "demo-project"}
            projectTitle={project.title}
            onClose={() => setShowChat(false)}
          />
        )}
      </div>
    </div>
  );
}
