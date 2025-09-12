import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './clienteServiceInit'; // 👈 Esto corre ANTES de renderizar tu App
import './equipoServiceInit';
import './ordenServicioServiceInit';
import './styles/MultiStepForm.css'; // estilos globales

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
