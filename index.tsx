
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LeadProvider } from './context/LeadContext';
import { FeatureFlagProvider } from './context/FeatureFlagContext';
import { SessionProvider } from './context/SessionContext';
import ErrorBoundary from './components/ErrorBoundary';
import './src/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <FeatureFlagProvider>
        <SessionProvider>
          <LeadProvider>
            <App />
          </LeadProvider>
        </SessionProvider>
      </FeatureFlagProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
