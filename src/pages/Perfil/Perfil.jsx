import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useAuthStore } from '../../store/authStore';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';

export default function Perfil() {
  const { user, setUser } = useAuthStore();
  const { request, loading } = useApi();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await request('put', `/usuarios/${user.id}`, formData);
      setUser({ ...user, ...formData });
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar perfil');
    }
  };

  return (
    <Container fluid>
      <h1 className="mb-4 fw-bold">👤 Mi Perfil</h1>

      <Row>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <strong>Información Personal</strong>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre Completo</Form.Label>
                  <Form.Control 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading}>
                  💾 Guardar Cambios
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <strong>Información de la Cuenta</strong>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <p className="text-muted small mb-1">Rol</p>
                <p className="fw-bold">{user?.rol?.toUpperCase()}</p>
              </div>

              <div className="mb-3">
                <p className="text-muted small mb-1">Carrera</p>
                <p className="fw-bold">{user?.carrera?.nombre || 'No asignada'}</p>
              </div>

              <div className="mb-3">
                <p className="text-muted small mb-1">Miembro desde</p>
                <p className="fw-bold">{new Date(user?.created_at).toLocaleDateString('es-ES')}</p>
              </div>

              <hr />

              <h6 className="fw-bold mb-3">Cambiar Contraseña</h6>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña Actual</Form.Label>
                  <Form.Control type="password" placeholder="••••••" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nueva Contraseña</Form.Label>
                  <Form.Control type="password" placeholder="••••••" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                  <Form.Control type="password" placeholder="••••••" />
                </Form.Group>

                <Button variant="secondary" size="sm">
                  🔐 Cambiar Contraseña
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
