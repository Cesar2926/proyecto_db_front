import LogoDiagonal from '../assets/LogoDiagonal.png';
import LogoDerecho from '../assets/LogoDerecho.png';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      alert('Por favor ingresa usuario y contraseña');
      return;
    }
    setLoading(true);
    try {
      // Asumiendo que tu endpoint es /login o similar
      /*const response = await api.post('/login', { 
            username, 
            password 
        });*/
      // console.log('Respuesta del servidor:', response.data);
      navigate('/home');
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
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-4">
        <img className="w-1/3" src={LogoDerecho} alt="Logo Derecho" />
        <h1 className="text-2xl font-bold">Clínica Jurídica</h1>
        <input
          type="text"
          placeholder="Usuario"
          className="w-1/3 h-12 rounded-full border-2 bg-red-900 text-white p-4 placeholder-white focus:outline-none focus:ring-0 focus:border-red-700"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-1/3 h-12 rounded-full border-2 bg-red-900 text-white p-4 placeholder-white focus:outline-none focus:ring-0 focus:border-red-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-50 h-10 rounded-full bg-gray-700 text-white focus:bg-amber-50"
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
