
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeStorage } from './integrations/supabase/client'; // Import the initialization function
import { importSubscriptionsIfNeeded } from './utils/importAllSubscriptions'; // Import the script to import subscriptions

// Initialize Supabase storage buckets
initializeStorage().catch(console.error);

// Import sample subscriptions if needed
importSubscriptionsIfNeeded().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
