import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { preloadBulkStudentsFromCsv } from './data/mockStore';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Awaited before the first render so every component sees the final bulk
// roster (public/students.csv) on first paint — not a demo-only list that
// grows after a background fetch resolves.
preloadBulkStudentsFromCsv().finally(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
