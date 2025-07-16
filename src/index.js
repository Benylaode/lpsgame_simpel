import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Pastikan jalur ini benar ke App.js Anda

// Membuat root React baru
const root = ReactDOM.createRoot(document.getElementById('root'));

// Me-render komponen App ke dalam elemen dengan id 'root'
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
