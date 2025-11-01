import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Spinner, Pagination } from 'react-bootstrap';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import SearchFilter from '../../components/Common/SearchFilter';
import toast from 'react-hot-toast';

export default function Consumibles() {
  const [consumibles, setConsumibles] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtros, setFiltros] = useState({ search: '', stock_status: '', categoria_id: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria_id: '',
    stock: '',
    stock_minimo: '',
    unidad_medida: 'unidad',
  });
  const { request, loading } = useApi();

  useEffect(() => {
    fetchCategorias();
    fetchConsumibles();
  }, [filtros, currentPage]);

  const fetchCategorias = async () => {
    try {
      const response = await request('get', '/categorias');
      setCategorias(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchConsumibles = async () => {
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
      };
      if (filtros.search) params.search = filtros.search;
      if (filtros.categoria_id) params.categoria_id = filtros.categoria_id;
      
      const response = await request('get', '/consumibles', { params });
      console.log('Consumibles response:', response);
      let data = response.data.data || [];

      // Filtrar por stock_status
      if (filtros.stock_status === 'bajo') {
        data = data.filter(c => c.stock <= c.stock_minimo);
      } else if (filtros.stock_status === 'critico') {
        data = data.filter(c => c.stock <= c.stock_minimo * 0.5);
      } else if (filtros.stock_status === 'normal') {
        data = data.filter(c => c.stock > c.stock_minimo);
      }

      setConsumibles(data);
      setTotalPages(response.data.last_page || 1);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar consumibles');
    }
  };

  const handleSaveConsumible = async () => {
    if (!formData.nombre) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!formData.categoria_id) {
      toast.error('Debe seleccionar una categoría');
      return;
    }

    try {
      const dataToSend = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria_id: parseInt(formData.categoria_id),
        stock: parseInt(formData.stock) || 0,
        stock_minimo: parseInt(formData.stock_minimo) || 0,
        unidad_medida: formData.unidad_medida,
        carrera_id: 1,
      };

      if (editingId) {
        await request('put', `/consumibles/${editingId}`, dataToSend);
        toast.success('Consumible actualizado exitosamente');
      } else {
        await request('post', '/consumibles', dataToSend);
        toast.success('Consumible creado exitosamente');
      }
      handleCloseModal();
      setCurrentPage(1);
      fetchConsumibles();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al guardar consumible');
    }
  };

  const handleEdit = (consumible) => {
    setEditingId(consumible.id);
    setFormData({
      nombre: consumible.nombre,
      descripcion: consumible.descripcion || '',
      categoria_id: consumible.categoria_id || '',
      stock: consumible.stock || '',
      stock_minimo: consumible.stock_minimo || '',
      unidad_medida: consumible.unidad_medida || 'unidad',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este consumible?')) {
      try {
        await request('delete', `/consumibles/${id}`);
        toast.success('Consumible eliminado exitosamente');
        fetchConsumibles();
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al eliminar consumible');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      nombre: '',
      descripcion: '',
      categoria_id: '',
      stock: '',
      stock_minimo: '',
      unidad_medida: 'unidad',
    });
  };

  const handleFilterChange = (key, value) => {
    setFiltros({ ...filtros, [key]: value });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFiltros({ search: '', stock_status: '', categoria_id: '' });
    setCurrentPage(1);
  };

  if (loading && consumibles.length === 0) return <LoadingSpinner />;

  const stockBajoCount = consumibles.filter(c => c.stock <= c.stock_minimo).length;

  return (
    <Container fluid>
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="fw-bold">📫 Consumibles</h1>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => {
              setEditingId(null);
              setFormData({
                nombre: '',
                descripcion: '',
                categoria_id: '',
                stock: '',
                stock_minimo: '',
                unidad_medida: 'unidad',
              });
              setShowModal(true);
            }}
          >
            ➕ Nuevo Consumible
          </Button>
        </Col>
      </Row>

      {/* Alert Stock Bajo */}
      {stockBajoCount > 0 && (
        <Card className="mb-4 border-danger bg-light">
          <Card.Body className="d-flex align-items-center gap-3">
            <div style={{ fontSize: '1.5rem' }}>⚠️</div>
            <div>
              <strong>⚠️ {stockBajoCount} consumibles con stock bajo</strong>
              <p className="text-muted small mb-0">Revisar y reabastecer en breve</p>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Filtros Avanzados */}
      <Card className="mb-4">
        <Card.Body>
          <SearchFilter
            filters={filtros}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            filterOptions={{
              search: {
                label: 'Buscar por nombre',
                placeholder: 'Buscar consumible...',
                span: 3,
              },
              categoria: {
                label: 'Categoría',
                span: 3,
                options: categorias,
              },
              stock_status: {
                label: 'Estado de stock',
                span: 3,
              },
              actions: { span: 3 },
            }}
          />
        </Card.Body>
      </Card>

      {/* Tabla */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <strong>Listado de Consumibles ({consumibles.length})</strong>
          <small className="text-muted">Página {currentPage} de {totalPages}</small>
        </Card.Header>
        <Card.Body>
          {consumibles && consumibles.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Stock Actual</th>
                      <th>Stock Mínimo</th>
                      <th>Unidad</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consumibles.map((item) => {
                      const stockBajo = item.stock <= item.stock_minimo;
                      const stockCritico = item.stock <= item.stock_minimo * 0.5;
                      return (
                        <tr key={item.id} className={stockCritico ? 'table-danger' : stockBajo ? 'table-warning' : ''}>
                          <td><strong>{item.nombre || '-'}</strong></td>
                          <td>{item.categoria?.nombre || '-'}</td>
                          <td><strong>{item.stock || 0}</strong></td>
                          <td>{item.stock_minimo || 0}</td>
                          <td>{item.unidad_medida || 'unidad'}</td>
                          <td>
                            {stockCritico ? (
                              <Badge bg="danger">🔴 CRÍTICO</Badge>
                            ) : stockBajo ? (
                              <Badge bg="warning">⚠️ BAJO</Badge>
                            ) : (
                              <Badge bg="success">🟢 OK</Badge>
                            )}
                          </td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleEdit(item)}
                            >
                              ✏️
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              🗑️
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => setCurrentPage(1)} 
                      disabled={currentPage === 1} 
                    />
                    <Pagination.Prev 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                      disabled={currentPage === 1} 
                    />
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                      Math.max(0, currentPage - 2),
                      Math.min(totalPages, currentPage + 1)
                    ).map(page => (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Pagination.Item>
                    ))}
                    
                    <Pagination.Next 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                      disabled={currentPage === totalPages} 
                    />
                    <Pagination.Last 
                      onClick={() => setCurrentPage(totalPages)} 
                      disabled={currentPage === totalPages} 
                    />
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No hay consumibles registrados</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? '✏️ Editar Consumible' : '➕ Nuevo Consumible'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label fw-bold">Nombre *</label>
            <input 
              type="text"
              className="form-control"
              placeholder="Ej: Papel A4"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Descripción</label>
            <textarea 
              className="form-control"
              rows="2"
              placeholder="Descripción del consumible"
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Categoría *</label>
            <select 
              className="form-select"
              value={formData.categoria_id}
              onChange={(e) => setFormData({...formData, categoria_id: e.target.value})}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <Row>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label fw-bold">Stock Actual *</label>
                <input 
                  type="number"
                  className="form-control"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                />
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label fw-bold">Stock Mínimo *</label>
                <input 
                  type="number"
                  className="form-control"
                  placeholder="10"
                  value={formData.stock_minimo}
                  onChange={(e) => setFormData({...formData, stock_minimo: e.target.value})}
                />
              </div>
            </Col>
          </Row>

          <div className="mb-3">
            <label className="form-label fw-bold">Unidad de Medida</label>
            <select 
              className="form-select"
              value={formData.unidad_medida}
              onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})}
            >
              <option value="unidad">Unidad</option>
              <option value="caja">Caja</option>
              <option value="litro">Litro</option>
              <option value="kilogramo">Kilogramo</option>
              <option value="metro">Metro</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveConsumible} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              editingId ? '✏️ Actualizar Consumible' : '➕ Crear Consumible'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
