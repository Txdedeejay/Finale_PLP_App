import React, { useState } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import ProjectManager from "./ProjectManager";
import NGOMatcher from "./NGOMatcher";
import GroupChat from "./GroupChat";
import FileUpload from "./FileUpload";

export default function DashboardLayout() {
  const { user } = useUser(); // Clerk user
  const [activeProject, setActiveProject] = useState(null);

  if (!user) return <div>Loading user...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section - Blue Theme */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white p-12 shadow-xl">
        <div className="max-w-7xl mx-auto">
          {/* Header with logout */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-5xl font-bold mb-2 text-white">🤝 NGO Collaboration Platform</h1>
              <p className="text-lg opacity-95 text-blue-50">Empowering communities through collaborative projects</p>
            </div>
            <SignOutButton>
              <button className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold shadow-md hover:shadow-lg">
                Logout
              </button>
            </SignOutButton>
          </div>

          {/* Welcome section */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-20">
            <p className="text-2xl font-semibold text-white">Welcome back, <span className="text-yellow-200">{user.fullName || user.firstName}</span>! 👋</p>
            <p className="text-blue-50 opacity-90 mt-2">Continue making a difference by managing your projects and collaborating with your team.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* First Row: Project Manager (spans 2 cols) and NGO Matcher */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Project Manager - takes 2 columns */}
          <div className="lg:col-span-2">
            <ProjectManager
              user={{
                name: user.fullName || user.firstName,
                email: user.emailAddresses[0]?.emailAddress,
                id: user.id,
              }}
              activeProject={activeProject}
              setActiveProject={setActiveProject}
            />
          </div>

          {/* NGO Matcher */}
          <div>
            <NGOMatcher />
          </div>
        </div>

        {/* Second Row: Chat and File Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Group Chat */}
          <GroupChat
            user={{
              name: user.fullName || user.firstName,
              email: user.emailAddresses[0]?.emailAddress,
              id: user.id,
            }}
          />

          {/* File Upload */}
          <FileUpload />
        </div>
      </div>
    </div>
  );
}
