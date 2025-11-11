import { ClerkProvider } from '@clerk/clerk-react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import ErrorBoundary from './ErrorBoundary';

// Prefer the publishable key; fall back to other env names if available.
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || null;
const clerkFrontendApi = import.meta.env.VITE_CLERK_FRONTEND_API || null;

const hasClerkConfig = Boolean(clerkPublishableKey || clerkFrontendApi);

ReactDOM.createRoot(document.getElementById('root')).render(
  hasClerkConfig ? (
    <ClerkProvider
      // publishableKey is preferred for client-side SDK
      publishableKey={clerkPublishableKey}
      // provide frontendApi if available (some Clerk setups use frontendApi)
      frontendApi={clerkFrontendApi}
      navigate={(to) => window.history.pushState(null, '', to)}
    >
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ClerkProvider>
  ) : (
    <ErrorBoundary>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: '#f7f6ff',
        color: '#2d2b6a'
      }}>
        <div style={{ maxWidth: 780 }}>
          <h1 style={{ marginBottom: 8 }}>Clerk configuration missing</h1>
          <p style={{ marginTop: 0 }}>The app couldn't find a Clerk publishable key or frontend API configuration.</p>
          <p style={{ color: '#333' }}>
            Please add a Vite env variable named <code>VITE_CLERK_PUBLISHABLE_KEY</code> (or
            <code>VITE_CLERK_FRONTEND_API</code>) to <strong>frontend/.env</strong> and restart the dev server.
          </p>
          <p style={{ marginTop: 12 }}>
            Example in <code>frontend/.env</code>:
          </p>
          <pre style={{ background: '#fff', padding: 12, borderRadius: 6, overflow: 'auto' }}>
            VITE_CLERK_PUBLISHABLE_KEY=pk_test_...your_key_here
          </pre>
        </div>
      </div>
    </ErrorBoundary>
  )
);
