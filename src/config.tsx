import React from 'react';
import ReactDOM from 'react-dom/client';
import Settings from './components/Settings.tsx';
import './config.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Settings />
  </React.StrictMode>,
);
