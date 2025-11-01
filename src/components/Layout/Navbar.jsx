import { Navbar, Container, Nav, Button, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { LogOut, Moon, Sun, Menu } from 'lucide-react';

export default function NavbarComponent({ onMenuClick }) {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  const getInitials = () => {
    return user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <Navbar 
      expand="lg" 
      sticky="top"
      data-bs-theme={isDark ? 'dark' : 'light'}
    >
      <Container fluid className="px-3 px-lg-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
          <Button
            variant="link"
            onClick={onMenuClick}
            className="d-md-none p-0 border-0"
            style={{ color: 'white' }}
          >
            <Menu size={28} />
          </Button>
          
          <Navbar.Brand 
            href="/dashboard"
            style={{ 
              fontSize: '20px', 
              fontWeight: '900',
              margin: 0,
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🏫 INICIO
          </Navbar.Brand>
        </div>

        <div style={{ flex: 1, textAlign: 'center' }} className="d-none d-lg-block">
          <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', opacity: 0.9, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Instituto de Educación Superior Tecnológico Público
          </p>
        </div>

        <Nav className="ms-auto align-items-center" style={{ gap: '14px' }}>
          <Button
            onClick={toggleTheme}
            variant="outline-light"
            size="sm"
            className="border-0 p-2"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          <div
            className="profile-avatar"
            title={user?.name || 'Usuario'}
          >
            {getInitials()}
          </div>

          <Button
            onClick={handleLogout}
            variant="primary"
            size="sm"
            className="d-flex align-items-center"
            style={{ gap: '8px', whiteSpace: 'nowrap', backgroundColor: '#e67e22', borderColor: '#e67e22' }}
          >
            <LogOut size={16} />
            <span className="d-none d-sm-inline">Salir</span>
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
}
