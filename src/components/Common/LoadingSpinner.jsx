import { Spinner, Container } from 'react-bootstrap';

export default function LoadingSpinner() {
  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
      <Spinner animation="border" variant="primary" />
    </Container>
  );
}
