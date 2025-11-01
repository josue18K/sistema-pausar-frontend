import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Truck, Users, BarChart3, Settings, X } from 'lucide-react';
import { Button } from 'react-bootstrap';

const icons = {
  dashboard: '📊',
  inventario: '📦',
  consumibles: '🛒',
  movimientos: '🚚',
  usuarios: '👥',
  reportes: '📈',
  configuracion: '⚙️'
};

export default function Sidebar({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
    { path: '/inventario', label: 'Inventario', icon: Package, key: 'inventario' },
    { path: '/consumibles', label: 'Consumibles', icon: ShoppingCart, key: 'consumibles' },
    { path: '/movimientos', label: 'Movimientos', icon: Truck, key: 'movimientos' },
    { path: '/usuarios', label: 'Usuarios', icon: Users, key: 'usuarios' },
    { path: '/reportes', label: 'Reportes', icon: BarChart3, key: 'reportes' },
    { path: '/configuracion', label: 'Configuración', icon: Settings, key: 'configuracion' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <div style={{ padding: '20px 12px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', marginTop: '8px' }}>
        <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '900', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px', color: 'white' }}>
          🎯 MENÚ
        </h5>
        <Button 
          variant="link" 
          onClick={onClose}
          className="d-md-none p-0 border-0"
          style={{ color: 'white' }}
        >
          <X size={24} />
        </Button>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className="sidebar-menu-item"
              style={{
                backgroundColor: isActive ? '#e67e22' : 'rgba(255, 255, 255, 0.1)',
                color: isActive ? 'white' : 'rgba(255, 255, 255, 0.85)',
              }}
            >
              <span style={{ fontSize: '24px' }}>{icons[item.key]}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ paddingTop: '16px', borderTop: '2px solid rgba(255, 255, 255, 0.2)' }}>
        <p style={{ fontSize: '11px', opacity: 0.8, margin: 0, textAlign: 'center', color: 'white', fontWeight: '700', textTransform: 'uppercase' }}>
          © 2025 Josue-David-Ramos-Neira-Derechos-Reservados
        </p>
      </div>
    </div>
  );
}
