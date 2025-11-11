import React from 'react';

export default function Dashboard({ user, token, setActiveProject }) {
  return (
    <div>
      <h1>🏠 Dashboard</h1>
      <p>Welcome, {user.name}!</p>
      <p>Your token: {token}</p>
      <p>Use the sidebar to navigate through projects, data, files, chat, and AI assistant.</p>
    </div>
  );
}
