// App.jsx — assume app is wrapped by ClerkProvider in main.jsx
import React from "react";
import { SignedIn, SignedOut, useUser, RedirectToSignIn } from "@clerk/clerk-react";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./components/Dashboard";

export default function App() {
  return <AuthWrapper />;
}

function AuthWrapper() {
  return (
    <>
      <SignedIn>
        <UserDashboard />
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function UserDashboard() {
  const { user } = useUser();

  if (!user) return <div>Loading user...</div>;

  return (
    <DashboardLayout
      user={{
        name: user.fullName,
        email: user.emailAddresses[0]?.emailAddress,
        id: user.id,
      }}
      token={user.id}
      setUser={() => {}}
      setToken={() => {}}
    />
  );
}
