import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Loader from './common/Loader';

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <Loader fullScreen text="Verificando sesión..." />;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
