import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { testBackendConnection } from './utils/testConnection';

if (process.env.NODE_ENV === 'development') {
  testBackendConnection();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
