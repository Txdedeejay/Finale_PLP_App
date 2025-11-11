import React, { useState, useEffect } from "react";
import api from "../../api";

export default function NotesModal({ projectId, onClose }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load notes from backend
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        // You'll create this endpoint on backend
        const response = await api.get(`/projects/${projectId}/notes`);
        setNotes(response.data || []);
      } catch (err) {
        console.error("Failed to load notes:", err);
        // For now, use empty array if endpoint doesn't exist
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [projectId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setLoading(true);
      const response = await api.post(`/projects/${projectId}/notes`, {
        content: newNote,
        createdAt: new Date().toISOString(),
      });
      setNotes([...notes, response.data]);
      setNewNote("");
      setError("");
    } catch (err) {
      console.error("Failed to add note:", err);
      setError("Failed to add note. Make sure backend endpoint exists.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (noteId) => {
    if (!editingText.trim()) return;

    try {
      setLoading(true);
      await api.put(`/projects/${projectId}/notes/${noteId}`, {
        content: editingText,
      });
      setNotes(notes.map((n) => (n._id === noteId ? { ...n, content: editingText } : n)));
      setEditingId(null);
      setEditingText("");
      setError("");
    } catch (err) {
      console.error("Failed to update note:", err);
      setError("Failed to update note.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      setLoading(true);
      await api.delete(`/projects/${projectId}/notes/${noteId}`);
      setNotes(notes.filter((n) => n._id !== noteId));
      setError("");
    } catch (err) {
      console.error("Failed to delete note:", err);
      setError("Failed to delete note.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-blue-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <h2 className="text-2xl font-bold text-slate-800">📝 Project Notes</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold shadow-md"
          >
            ✕ Close
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-500 font-medium">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Add new note */}
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Add New Note</label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Type your note here..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none text-slate-700"
              rows="3"
            />
            <button
              onClick={handleAddNote}
              disabled={loading || !newNote.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition font-semibold shadow-md"
            >
              {loading ? "Adding..." : "✚ Add Note"}
            </button>
          </div>

          {/* Notes list */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-800">
              Notes ({notes.length})
            </h3>
            {notes.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No notes yet. Add one above!</p>
            ) : (
              notes.map((note) => (
                <div key={note._id || Math.random()} className="bg-slate-50 p-4 rounded-lg border border-blue-100">
                  {editingId === note._id ? (
                    <div>
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none text-slate-700"
                        rows="2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateNote(note._id)}
                          disabled={loading}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition font-semibold"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition font-semibold"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 mb-2">{note.content}</p>
                      <p className="text-xs text-gray-500 mb-2">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(note._id);
                            setEditingText(note.content);
                          }}
                          className="px-2 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          disabled={loading}
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
