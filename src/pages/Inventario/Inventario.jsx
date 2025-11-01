import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Spinner, Pagination } from 'react-bootstrap';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import SearchFilter from '../../components/Common/SearchFilter';
import ImportExcel from '../../components/Common/ImportExcel';
import toast from 'react-hot-toast';

export default function Inventario() {
  const [items, setItems] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [filtros, setFiltros] = useState({ estado: '', search: '' });
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria_id: '',
    laboratorio_id: '',
    estado: 'activo',
    valor: '',
  });
  const { request, loading } = useApi();

  useEffect(() => {
    fetchCategorias();
    fetchLaboratorios();
    fetchItems();
  }, [filtros, currentPage]);

  const fetchCategorias = async () => {
    try {
      const response = await request('get', '/categorias');
      setCategorias(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchLaboratorios = async () => {
    try {
      const response = await request('get', '/laboratorios');
      setLaboratorios(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
      };
      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.search) params.search = filtros.search;
      
      const response = await request('get', '/items', { params });
      console.log('Items response:', response);
      setItems(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar items');
    }
  };

  const handleSaveItem = async () => {
    if (!formData.codigo || !formData.nombre) {
      toast.error('Código y nombre son requeridos');
      return;
    }

    if (!formData.categoria_id || !formData.laboratorio_id) {
      toast.error('Categoría y laboratorio son requeridos');
      return;
    }

    try {
      const dataToSend = {
        codigo: formData.codigo,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria_id: parseInt(formData.categoria_id),
        laboratorio_id: parseInt(formData.laboratorio_id),
        estado: formData.estado,
        valor: parseFloat(formData.valor) || 0,
        carrera_id: 1,
        fecha_adquisicion: new Date().toISOString().split('T')[0],
        responsable_id: 1,
      };

      if (editingId) {
        await request('put', `/items/${editingId}`, dataToSend);
        toast.success('Item actualizado exitosamente');
      } else {
        await request('post', '/items', dataToSend);
        toast.success('Item creado exitosamente');
      }
      handleCloseModal();
      setCurrentPage(1);
      fetchItems();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al guardar item');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      codigo: item.codigo,
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      categoria_id: item.categoria_id || '',
      laboratorio_id: item.laboratorio_id || '',
      estado: item.estado,
      valor: item.valor || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este item?')) {
      try {
        await request('delete', `/items/${id}`);
        toast.success('Item eliminado exitosamente');
        fetchItems();
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al eliminar item');
      }
    }
  };

  const handleImportExcel = async (data) => {
    try {
      let importados = 0;
      let errores = 0;

      for (const row of data) {
        try {
          if (!row.codigo || !row.nombre) continue;

          await request('post', '/items', {
            codigo: row.codigo,
            nombre: row.nombre,
            descripcion: row.descripcion || '',
            categoria_id: row.categoria_id || 1,
            laboratorio_id: row.laboratorio_id || 1,
            estado: row.estado || 'activo',
            valor: parseFloat(row.valor) || 0,
            carrera_id: 1,
            fecha_adquisicion: new Date().toISOString().split('T')[0],
            responsable_id: 1,
          });
          importados++;
        } catch (error) {
          errores++;
        }
      }

      toast.success(`✓ Importados: ${importados}, Errores: ${errores}`);
      setShowImport(false);
      setCurrentPage(1);
      fetchItems();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al importar items');
    }
  };

  const getEstadoBadge = (estado) => {
    const variants = {
      activo: 'success',
      mantenimiento: 'warning',
      baja: 'danger',
    };
    return <Badge bg={variants[estado] || 'secondary'}>{String(estado).toUpperCase()}</Badge>;
  };

  const formatValue = (value) => {
    try {
      const num = parseFloat(value);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    } catch (error) {
      return '0.00';
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria_id: '',
      laboratorio_id: '',
      estado: 'activo',
      valor: '',
    });
  };

  const handleFilterChange = (key, value) => {
    setFiltros({ ...filtros, [key]: value });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFiltros({ estado: '', search: '' });
    setCurrentPage(1);
  };

  if (loading && items.length === 0) return <LoadingSpinner />;

  return (
    <Container fluid>
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="fw-bold">📦 Inventario de Items</h1>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          <Button 
            variant="outline-info" 
            onClick={() => setShowImport(true)}
          >
            📥 Importar Excel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              setEditingId(null);
              setFormData({
                codigo: '',
                nombre: '',
                descripcion: '',
                categoria_id: '',
                laboratorio_id: '',
                estado: 'activo',
                valor: '',
              });
              setShowModal(true);
            }}
          >
            ➕ Nuevo Item
          </Button>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <SearchFilter
            filters={filtros}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            filterOptions={{
              search: {
                label: 'Buscar por código o nombre',
                placeholder: 'Buscar...',
                span: 4,
              },
              estado: {
                label: 'Estado',
                span: 4,
                options: [
                  { value: 'activo', label: 'Activo' },
                  { value: 'mantenimiento', label: 'Mantenimiento' },
                  { value: 'baja', label: 'Baja' },
                ],
              },
              actions: { span: 4 },
            }}
          />
        </Card.Body>
      </Card>

      {/* Tabla */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <strong>Listado de Items ({items.length})</strong>
          <small className="text-muted">Página {currentPage} de {totalPages}</small>
        </Card.Header>
        <Card.Body>
          {items && items.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Laboratorio</th>
                      <th>Estado</th>
                      <th>Valor</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.codigo || '-'}</strong>
                        </td>
                        <td>{item.nombre || '-'}</td>
                        <td>{item.categoria?.nombre || '-'}</td>
                        <td>{item.laboratorio?.nombre || '-'}</td>
                        <td>{getEstadoBadge(item.estado)}</td>
                        <td>S/. {formatValue(item.valor)}</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleEdit(item)}
                            title="Editar"
                          >
                            ✏️
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            title="Eliminar"
                          >
                            🗑️
                          </Button>
                        </td>
                      </tr>
                    ))}
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
              <p className="text-muted">No hay items registrados</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? '✏️ Editar Item' : '➕ Nuevo Item'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label fw-bold">Código *</label>
            <input 
              type="text"
              className="form-control"
              placeholder="Ej: ITEM-001"
              value={formData.codigo}
              onChange={(e) => setFormData({...formData, codigo: e.target.value})}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Nombre *</label>
            <input 
              type="text"
              className="form-control"
              placeholder="Nombre del item"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Descripción</label>
            <textarea 
              className="form-control"
              rows="3"
              placeholder="Descripción del item"
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            />
          </div>

          <Row>
            <Col md={6}>
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
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label fw-bold">Laboratorio *</label>
                <select 
                  className="form-select"
                  value={formData.laboratorio_id}
                  onChange={(e) => setFormData({...formData, laboratorio_id: e.target.value})}
                >
                  <option value="">Seleccionar laboratorio</option>
                  {laboratorios.map(lab => (
                    <option key={lab.id} value={lab.id}>
                      {lab.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label fw-bold">Estado</label>
                <select 
                  className="form-select"
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                >
                  <option value="activo">Activo</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label fw-bold">Valor (S/.)</label>
                <input 
                  type="number"
                  className="form-control"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: e.target.value})}
                />
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveItem} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              editingId ? '✏️ Actualizar Item' : '➕ Crear Item'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Importar */}
      <ImportExcel 
        show={showImport} 
        onHide={() => setShowImport(false)}
        onImport={handleImportExcel}
        loading={loading}
      />
    </Container>
  );
}
