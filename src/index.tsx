// src/index.tsx (for Create React App)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Your global CSS
import App from './App'; // Your main App component

// --- Standard Amplify Configuration for Gen 1 (v5.x.x) ---
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
Amplify.configure(awsExports);
// --- End Standard Amplify Configuration ---

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);