import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row>
        <Col className="text-center">
          <h1 className="display-1 fw-bold text-primary">404</h1>
          <h2 className="mb-3">Página no encontrada</h2>
          <p className="text-muted mb-4">Lo sentimos, la página que buscas no existe</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            🏠 Volver al Dashboard
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
