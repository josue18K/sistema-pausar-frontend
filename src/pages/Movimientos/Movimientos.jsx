import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, Modal, Button, Spinner } from 'react-bootstrap';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [items, setItems] = useState([]);
  const [consumibles, setConsumibles] = useState([]);
  const [filtros, setFiltros] = useState({ tipo: '' });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    item_id: '',
    consumible_id: '',
    tipo: 'entrada',
    cantidad: '',
    observaciones: '',
  });
  const { request, loading } = useApi();

  useEffect(() => {
    fetchItems();
    fetchConsumibles();
    fetchMovimientos();
  }, [filtros]);

  const fetchItems = async () => {
    try {
      const response = await request('get', '/items');
      setItems(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchConsumibles = async () => {
    try {
      const response = await request('get', '/consumibles');
      setConsumibles(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchMovimientos = async () => {
    try {
      const params = {};
      if (filtros.tipo) params.tipo = filtros.tipo;
      
      const response = await request('get', '/movimientos', { params });
      console.log('Movimientos response:', response);
      setMovimientos(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar movimientos');
    }
  };

  const handleSaveMovimiento = async () => {
    if (!formData.tipo) {
      toast.error('Debe seleccionar un tipo de movimiento');
      return;
    }

    if (!formData.item_id && !formData.consumible_id) {
      toast.error('Debe seleccionar un item o consumible');
      return;
    }

    if (!formData.cantidad) {
      toast.error('Debe ingresar una cantidad');
      return;
    }

    try {
      const dataToSend = {
        tipo: formData.tipo,
        cantidad: parseInt(formData.cantidad),
        observaciones: formData.observaciones,
      };

      if (formData.item_id) {
        dataToSend.item_id = parseInt(formData.item_id);
      }

      if (formData.consumible_id) {
        dataToSend.consumible_id = parseInt(formData.consumible_id);
      }

      await request('post', '/movimientos', dataToSend);
      toast.success('Movimiento registrado exitosamente');
      handleCloseModal();
      fetchMovimientos();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al guardar movimiento');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      item_id: '',
      consumible_id: '',
      tipo: 'entrada',
      cantidad: '',
      observaciones: '',
    });
  };

  const getTipoBadge = (tipo) => {
    const variants = {
      entrada: 'success',
      salida: 'warning',
      mantenimiento: 'info',
      baja: 'danger',
    };
    return <Badge bg={variants[tipo] || 'secondary'}>{String(tipo).toUpperCase()}</Badge>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && movimientos.length === 0) return <LoadingSpinner />;

  return (
    <Container fluid>
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="fw-bold">🔄 Movimientos</h1>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => {
              setFormData({
                item_id: '',
                consumible_id: '',
                tipo: 'entrada',
                cantidad: '',
                observaciones: '',
              });
              setShowModal(true);
            }}
          >
            ➕ Nuevo Movimiento
          </Button>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold">Tipo de Movimiento</Form.Label>
                <Form.Select 
                  value={filtros.tipo}
                  onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                >
                  <option value="">Todos los tipos</option>
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="baja">Baja</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla */}
      <Card>
        <Card.Header>
          <strong>Historial de Movimientos ({movimientos.length})</strong>
        </Card.Header>
        <Card.Body>
          {movimientos && movimientos.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Item/Consumible</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Usuario</th>
                    <th>Observaciones</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>
                          {item.item?.nombre || item.consumible?.nombre || '-'}
                        </strong>
                      </td>
                      <td>{getTipoBadge(item.tipo)}</td>
                      <td>{item.cantidad || '-'}</td>
                      <td>{item.usuario?.name || '-'}</td>
                      <td>{item.observaciones || '-'}</td>
                      <td>{formatDate(item.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No hay movimientos registrados</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>➕ Nuevo Movimiento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Movimiento *</Form.Label>
              <Form.Select 
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              >
                <option value="entrada">📥 Entrada</option>
                <option value="salida">📤 Salida</option>
                <option value="mantenimiento">🔧 Mantenimiento</option>
                <option value="baja">❌ Baja</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Item *</Form.Label>
              <Form.Select 
                value={formData.item_id}
                onChange={(e) => setFormData({...formData, item_id: e.target.value, consumible_id: ''})}
              >
                <option value="">Seleccionar item</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.codigo} - {item.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {!formData.item_id && (
              <Form.Group className="mb-3">
                <Form.Label>Consumible *</Form.Label>
                <Form.Select 
                  value={formData.consumible_id}
                  onChange={(e) => setFormData({...formData, consumible_id: e.target.value, item_id: ''})}
                >
                  <option value="">Seleccionar consumible</option>
                  {consumibles.map(consumible => (
                    <option key={consumible.id} value={consumible.id}>
                      {consumible.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Cantidad *</Form.Label>
              <Form.Control 
                type="number"
                placeholder="1"
                value={formData.cantidad}
                onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control 
                as="textarea"
                rows={3}
                placeholder="Notas sobre este movimiento..."
                value={formData.observaciones}
                onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveMovimiento} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              '➕ Registrar Movimiento'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
