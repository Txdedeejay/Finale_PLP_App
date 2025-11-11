import React, { useState, useEffect } from "react";
import ProjectWorkspace from "./ProjectWorkspace";

export default function ProjectManager({ user, activeProject, setActiveProject }) {
  const [projects, setProjects] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    timeline: '',
    volunteersNeeded: 0
  });
  const [hoveredProject, setHoveredProject] = useState(null);

  useEffect(() => {
    const mockProjects = [
      {
        id: 1,
        title: 'Community Education Program',
        description: 'Providing education resources to underprivileged communities',
        status: 'Active',
        progress: 65,
        volunteers: 12,
        deadline: '2024-03-15',
        category: 'Education',
        budget: 5000,
        createdBy: user.name
      },
    ];
    setProjects(mockProjects);
  }, [user.name]);

  const handleCreateProject = () => {
    const project = {
      id: Date.now(),
      ...newProject,
      status: 'Planning',
      progress: 0,
      volunteers: 0,
      created: new Date().toISOString(),
      createdBy: user.name
    };
    setProjects(prev => [project, ...prev]);
    setNewProject({ title: '', description: '', category: '', budget: '', timeline: '', volunteersNeeded: 0 });
    setShowCreateForm(false);
  };

  const handleProjectSelect = (project) => setActiveProject(project);

  const handleWorkOnProject = () => {
    setShowWorkspace(true);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">📊 Project Management</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md hover:shadow-lg"
          onClick={() => setShowCreateForm(true)}
        >
          + Create New Project
        </button>
      </div>

      {/* Active Project Banner */}
      {activeProject && (
        <div className="flex justify-between items-center bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6">
          <div>
            <strong className="text-blue-900">Currently Working On: {activeProject.title}</strong>
            <div className="text-sm text-blue-700">
              Progress: {activeProject.progress}% • Status: {activeProject.status}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleWorkOnProject}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
            >
              🛠️ Work on Project
            </button>
            <button
              onClick={() => setActiveProject(null)}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Change Project
            </button>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h3 className="text-lg font-semibold mb-3">Create New Project</h3>
          <input
            type="text"
            placeholder="Project Title"
            value={newProject.title}
            onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 mb-2 border rounded"
          />
          <textarea
            placeholder="Project Description"
            value={newProject.description}
            onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 mb-2 border rounded min-h-[100px]"
          />
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Category"
              value={newProject.category}
              onChange={(e) => setNewProject(prev => ({ ...prev, category: e.target.value }))}
              className="flex-1 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Budget"
              value={newProject.budget}
              onChange={(e) => setNewProject(prev => ({ ...prev, budget: e.target.value }))}
              className="flex-1 p-2 border rounded"
            />
          </div>
          <button
            onClick={handleCreateProject}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Create Project
          </button>
        </div>
      )}

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map(project => (
          <div
            key={project.id}
            onClick={() => handleProjectSelect(project)}
            onMouseEnter={() => setHoveredProject(project.id)}
            onMouseLeave={() => setHoveredProject(null)}
            className={`p-4 border rounded cursor-pointer transition ${
              activeProject?.id === project.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
            } ${hoveredProject === project.id ? 'shadow-lg -translate-y-1' : ''}`}
          >
            <h4 className="font-semibold text-lg">{project.title}</h4>
            <p className="text-gray-700">{project.description}</p>
            <div className="text-sm text-gray-600 mt-2 space-y-1">
              <div>Status: {project.status}</div>
              <div>Volunteers: {project.volunteers}</div>
              <div>Budget: ${project.budget}</div>
              <div>Progress: {project.progress}%</div>
            </div>
            {activeProject?.id === project.id && (
              <div className="mt-2 px-2 py-1 bg-green-500 text-white text-xs rounded text-center">
                ACTIVE
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Project Workspace Modal */}
      {showWorkspace && (
        <ProjectWorkspace
          project={activeProject}
          onClose={() => setShowWorkspace(false)}
        />
      )}
    </div>
  );
}
