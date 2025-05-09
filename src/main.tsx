
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeStorage } from './integrations/supabase/client'; // Import the initialization function
import './utils/importCurrentSubscriptions'; // Import the script to add subscriptions

// Initialize Supabase storage buckets
initializeStorage().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
