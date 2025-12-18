import LogoDiagonal from '../assets/LogoDiagonal.png';
import LogoDerecho from '../assets/LogoDerecho.png';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
//import api from '../services/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Verificar si ya hay sesión activa al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Si ya hay sesión, redirigir a home
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      alert('Por favor ingresa usuario y contraseña');
      return;
    }
    setLoading(true);
    try {
      // Descomentar cuando tengas el endpoint real
      /*const response = await api.post('/login', { 
            username, 
            password 
        });
      
      // Guardar token y userId del usuario logueado
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      */

      // TEMPORAL: Guardar userId de ejemplo (eliminar cuando uses la API real)
      localStorage.setItem('userId', 'USER_123');
      localStorage.setItem('token', 'token_ejemplo');

      // Usar replace: true para que el login no quede en el historial
      // Esto evita que el usuario pueda regresar al login con el botón "atrás"
      navigate('/home', { replace: true });
    } catch (error: any) {
      console.error('Error en login:', error);
      const mensajeError = error.response?.data?.message || 'Error al iniciar sesión';
      alert(mensajeError);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Imagen de fondo */}
      <img
        className="absolute inset-0 w-full h-full object-contain opacity-10"
        src={LogoDiagonal}
        alt="Logo Derecho"
      />

      {/* Contenedor para elementos del Login */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-3 md:gap-4 lg:gap-6 px-4">
        {/* Logo responsive */}
        <img
          className="w-2/3 md:w-1/2 lg:w-1/2 2xl:w-2/3 max-w-3xl"
          src={LogoDerecho}
          alt="Logo Derecho"
        />

        {/* Título responsive */}
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Clínica Jurídica</h1>

        {/* Input Usuario responsive */}
        <input
          type="text"
          placeholder="Usuario"
          className="w-11/12 md:w-2/3 lg:w-1/2 xl:w-1/3 max-w-md h-11 md:h-12 lg:h-14 rounded-full border-2 bg-red-900 text-white px-4 md:px-6 placeholder-white text-sm md:text-xl focus:outline-none focus:ring-0 focus:border-red-700"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Input Contraseña responsive */}
        <input
          type="password"
          placeholder="Contraseña"
          className="w-11/12 md:w-2/3 lg:w-1/2 xl:w-1/3 max-w-md h-11 md:h-12 lg:h- rounded-full border-2 bg-red-900 text-white px-4 md:px-6 placeholder-white text-sm md:text-xl focus:outline-none focus:ring-0 focus:border-red-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Botón responsive */}
        <button
          className="w-40 md:w-48 lg:w-56 h-10 md:h-11 lg:h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm md:text-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Iniciar sesión'}
        </button>
      </div>
    </div>
  );
}

export default Login;
