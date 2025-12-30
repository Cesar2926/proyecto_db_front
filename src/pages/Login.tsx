import LogoDiagonal from '../assets/LogoDiagonal.png';
import LogoDerecho from '../assets/LogoDerecho.png';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      await login({ username, password });
      // Navigation handled by useEffect
    } catch (err: any) {
      console.error('Error en login:', err);
      const mensajeError = err.response?.data?.message || 'Usuario o contraseña incorrectos';
      setError(mensajeError);
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

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Form responsive */}
        <form onSubmit={handleLogin} className="flex flex-col items-center gap-3 w-full">
          <input
            type="text"
            placeholder="Usuario"
            className="w-11/12 md:w-2/3 lg:w-1/2 xl:w-1/3 max-w-md h-11 md:h-12 lg:h-14 rounded-full border-2 bg-red-900 text-white px-4 md:px-6 placeholder-white text-sm md:text-xl focus:outline-none focus:ring-0 focus:border-red-700"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-11/12 md:w-2/3 lg:w-1/2 xl:w-1/3 max-w-md h-11 md:h-12 lg:h-14 rounded-full border-2 bg-red-900 text-white px-4 md:px-6 placeholder-white text-sm md:text-xl focus:outline-none focus:ring-0 focus:border-red-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-40 md:w-48 lg:w-56 h-10 md:h-11 lg:h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm md:text-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
