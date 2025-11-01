import { Badge } from 'react-bootstrap';

export default function StatusBadge({ status, type = 'estado' }) {
  const statusConfig = {
    // Para items
    activo: { bg: 'success', icon: '✓', text: 'Activo' },
    mantenimiento: { bg: 'warning', icon: '🔧', text: 'Mantenimiento' },
    baja: { bg: 'danger', icon: '✗', text: 'Baja' },
    
    // Para consumibles
    ok: { bg: 'success', icon: '✓', text: 'OK' },
    bajo: { bg: 'danger', icon: '⚠️', text: 'Stock Bajo' },
    critico: { bg: 'danger', icon: '🔴', text: 'Crítico' },
    
    // Para movimientos
    entrada: { bg: 'success', icon: '📥', text: 'Entrada' },
    salida: { bg: 'warning', icon: '📤', text: 'Salida' },
    normal: { bg: 'info', icon: 'ℹ️', text: 'Normal' },
  };

  const config = statusConfig[status] || { bg: 'secondary', icon: '?', text: status };

  return (
    <Badge bg={config.bg} className="px-2 py-2">
      {config.icon} {config.text}
    </Badge>
  );
}
