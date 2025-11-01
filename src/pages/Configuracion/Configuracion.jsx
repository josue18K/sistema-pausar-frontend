import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { useAuthStore } from '../../store/authStore';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { Save, Lock, Palette, Bell } from 'lucide-react';

export default function Configuracion() {
  const { user, setUser } = useAuthStore();
  const { request, loading } = useApi();
  const [notificaciones, setNotificaciones] = useState({
    stock_bajo: true,
    mantenimiento: true,
    reportes: true,
  });
  const [tema, setTema] = useState('claro');

  useEffect(() => {
    const savedTema = localStorage.getItem('tema') || 'claro';
    setTema(savedTema);
  }, []);

  const handleSaveSettings = async () => {
    try {
      localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
      localStorage.setItem('tema', tema);
      toast.success('⚙️ Configuración guardada exitosamente');
    } catch (error) {
      toast.error('Error al guardar configuración');
    }
  };

  const handleChangePassword = async () => {
    const currentPassword = prompt('Ingresa tu contraseña actual:');
    if (!currentPassword) return;

    const newPassword = prompt('Ingresa tu nueva contraseña:');
    if (!newPassword) return;

    const confirmPassword = prompt('Confirma tu nueva contraseña:');
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      await request('post', '/change-password', {
        current_password: currentPassword,
        password: newPassword,
      });
      toast.success('🔐 Contraseña actualizada');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <Container fluid>
        {/* Header */}
        <div className="mb-4">
          <h1 style={{ fontSize: '36px', fontWeight: '900', margin: 0, marginBottom: '8px', color: '#003d7a', textTransform: 'uppercase' }}>
            ⚙️ Configuración
          </h1>
          <p style={{ opacity: 0.6, fontSize: '15px', margin: 0, fontWeight: '700' }}>
            Personaliza tu experiencia en el sistema
          </p>
        </div>

        <Row style={{ marginLeft: '-8px', marginRight: '-8px' }}>
          {/* Cuenta */}
          <Col lg={6} className="mb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
            <Card className="h-100 border-0" style={{ borderTop: '4px solid #003d7a' }}>
              <Card.Body>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '36px' }}>👤</div>
                  <div>
                    <h5 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: '#003d7a', textTransform: 'uppercase' }}>
                      Mi Cuenta
                    </h5>
                  </div>
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '8px', color: '#003d7a' }}>
                    📧 Nombre Completo
                  </label>
                  <div style={{ padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '8px', fontWeight: '700' }}>
                    {user?.name || 'N/A'}
                  </div>
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '8px', color: '#003d7a' }}>
                    📮 Email
                  </label>
                  <div style={{ padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '8px', fontWeight: '700' }}>
                    {user?.email || 'N/A'}
                  </div>
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '8px', color: '#003d7a' }}>
                    🏷️ Rol
                  </label>
                  <div>
                    <Badge bg="primary" style={{ fontSize: '13px', padding: '8px 12px', textTransform: 'uppercase', fontWeight: '700' }}>
                      {user?.rol || 'N/A'}
                    </Badge>
                  </div>
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '8px', color: '#003d7a' }}>
                    📅 Miembro desde
                  </label>
                  <div style={{ padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '8px', fontWeight: '700' }}>
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}
                  </div>
                </div>

                <hr style={{ opacity: 0.2, margin: '20px 0' }} />

                <Button
                  onClick={handleChangePassword}
                  className="w-100"
                  variant="outline-danger"
                  style={{ fontWeight: '700', fontSize: '14px', textTransform: 'uppercase', padding: '10px' }}
                >
                  <Lock size={16} /> Cambiar Contraseña
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Notificaciones */}
          <Col lg={6} className="mb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
            <Card className="h-100 border-0" style={{ borderTop: '4px solid #e67e22' }}>
              <Card.Body>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '36px' }}>🔔</div>
                  <div>
                    <h5 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: '#e67e22', textTransform: 'uppercase' }}>
                      Notificaciones
                    </h5>
                  </div>
                </div>

                <div className="mb-3">
                  <Form.Check
                    type="switch"
                    id="stock_bajo"
                    label="⚠️ Alertas de Stock Bajo"
                    checked={notificaciones.stock_bajo}
                    onChange={(e) => setNotificaciones({ ...notificaciones, stock_bajo: e.target.checked })}
                    style={{ fontSize: '14px', fontWeight: '700' }}
                  />
                </div>

                <div className="mb-3">
                  <Form.Check
                    type="switch"
                    id="mantenimiento"
                    label="🔧 Alertas de Mantenimiento"
                    checked={notificaciones.mantenimiento}
                    onChange={(e) => setNotificaciones({ ...notificaciones, mantenimiento: e.target.checked })}
                    style={{ fontSize: '14px', fontWeight: '700' }}
                  />
                </div>

                <div className="mb-3">
                  <Form.Check
                    type="switch"
                    id="reportes"
                    label="📊 Reportes Semanales"
                    checked={notificaciones.reportes}
                    onChange={(e) => setNotificaciones({ ...notificaciones, reportes: e.target.checked })}
                    style={{ fontSize: '14px', fontWeight: '700' }}
                  />
                </div>

                <hr style={{ opacity: 0.2, margin: '20px 0' }} />

                <Alert variant="info" style={{ marginBottom: 0, fontWeight: '700', fontSize: '13px' }}>
                  💡 Las notificaciones se enviarán por email
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Apariencia */}
        <Row style={{ marginLeft: '-8px', marginRight: '-8px' }}>
          <Col lg={6} className="mb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
            <Card className="h-100 border-0" style={{ borderTop: '4px solid #27ae60' }}>
              <Card.Body>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '36px' }}>🎨</div>
                  <div>
                    <h5 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: '#27ae60', textTransform: 'uppercase' }}>
                      Apariencia
                    </h5>
                  </div>
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '12px', color: '#003d7a' }}>
                    🌓 Tema
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Form.Check
                      type="radio"
                      name="tema"
                      id="tema_claro"
                      label="☀️ Claro"
                      value="claro"
                      checked={tema === 'claro'}
                      onChange={(e) => setTema(e.target.value)}
                      style={{ fontWeight: '700' }}
                    />
                    <Form.Check
                      type="radio"
                      name="tema"
                      id="tema_oscuro"
                      label="🌙 Oscuro"
                      value="oscuro"
                      checked={tema === 'oscuro'}
                      onChange={(e) => setTema(e.target.value)}
                      style={{ fontWeight: '700' }}
                    />
                  </div>
                </div>

                <hr style={{ opacity: 0.2, margin: '20px 0' }} />

                <Alert variant="success" style={{ marginBottom: 0, fontWeight: '700', fontSize: '13px' }}>
                  ✅ La apariencia se aplicará inmediatamente
                </Alert>
              </Card.Body>
            </Card>
          </Col>

          {/* Sistema */}
          <Col lg={6} className="mb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
            <Card className="h-100 border-0" style={{ borderTop: '4px solid #e74c3c' }}>
              <Card.Body>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '36px' }}>ℹ️</div>
                  <div>
                    <h5 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: '#e74c3c', textTransform: 'uppercase' }}>
                      Información
                    </h5>
                  </div>
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '8px', color: '#003d7a' }}>
                    🏫 Institución
                  </label>
                  <div style={{ padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '8px', fontWeight: '700' }}>
                    Instituto de Educación Superior Tecnológico Público PAUSAR
                  </div>
                </div>

                <div className="mb-3">
                  <label style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '8px', color: '#003d7a' }}>
                    📦 Versión del Sistema
                  </label>
                  <div style={{ padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '8px', fontWeight: '700' }}>
                    v1.0.0
                  </div>
                </div>

                <Alert variant="warning" style={{ marginBottom: 0, fontWeight: '700', fontSize: '13px' }}>
                  ⚠️ Para cualquier problema, contacta al administrador
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Save Button */}
        <Row className="mt-4" style={{ marginLeft: '-8px', marginRight: '-8px' }}>
          <Col xs={12} style={{ paddingLeft: '8px', paddingRight: '8px' }}>
            <Button
              onClick={handleSaveSettings}
              size="lg"
              className="w-100"
              style={{
                backgroundColor: '#003d7a',
                borderColor: '#003d7a',
                fontWeight: '900',
                fontSize: '16px',
                textTransform: 'uppercase',
                padding: '12px'
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={20} className="me-2" />
                  💾 Guardar Configuración
                </>
              )}
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
