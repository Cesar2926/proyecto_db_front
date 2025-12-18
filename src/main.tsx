import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './global.css';
import Login from './pages/Login.tsx';
import Home from './pages/Home.tsx';
import Casos from './pages/Casos.tsx';
import CasoDetalle from './pages/CasoDetalle.tsx';
import Registro from './pages/Registro.tsx';
import RegistroCaso from './pages/RegistroCaso.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/casos" element={<Casos />} />
        <Route path="/casos/:numCaso" element={<CasoDetalle />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/registro-caso" element={<RegistroCaso />} />
      </Routes>
    </Router>
  </StrictMode>
);
