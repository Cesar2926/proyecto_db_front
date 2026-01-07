import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './global.css';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  </StrictMode>
);

