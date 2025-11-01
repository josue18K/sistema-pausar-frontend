import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Inventario from './pages/Inventario/Inventario';
import Consumibles from './pages/Consumibles/Consumibles';
import Movimientos from './pages/Movimientos/Movimientos';
import Usuarios from './pages/Usuarios/Usuarios';
import Reportes from './pages/Reportes/Reportes';
import Perfil from './pages/Perfil/Perfil';
import Configuracion from './pages/Configuracion/Configuracion';
import NotFound from './pages/NotFound/NotFound';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/inventario" element={<ProtectedRoute><Layout><Inventario /></Layout></ProtectedRoute>} />
          <Route path="/consumibles" element={<ProtectedRoute><Layout><Consumibles /></Layout></ProtectedRoute>} />
          <Route path="/movimientos" element={<ProtectedRoute><Layout><Movimientos /></Layout></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute><Layout><Usuarios /></Layout></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute><Layout><Reportes /></Layout></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Layout><Perfil /></Layout></ProtectedRoute>} />
          <Route path="/configuracion" element={<ProtectedRoute><Layout><Configuracion /></Layout></ProtectedRoute>} />

          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
