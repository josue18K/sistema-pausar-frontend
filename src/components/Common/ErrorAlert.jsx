import { Alert } from 'react-bootstrap';

export default function ErrorAlert({ message }) {
  return (
    <Alert variant="danger" className="m-4">
      <h4>Error</h4>
      <p>{message}</p>
    </Alert>
  );
}
