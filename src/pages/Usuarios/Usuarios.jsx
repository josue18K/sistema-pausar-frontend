import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, Spinner } from 'react-bootstrap';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtros, setFiltros] = useState({ rol: '', search: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rol: 'responsable',
  });
  const { request, loading } = useApi();

  useEffect(() => {
    fetchUsuarios();
  }, [filtros]);

  const fetchUsuarios = async () => {
    try {
      const params = {};
      if (filtros.rol) params.rol = filtros.rol;
      if (filtros.search) params.search = filtros.search;
      
      const response = await request('get', '/usuarios', { params });
      console.log('Usuarios response:', response);
      setUsuarios(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar usuarios');
    }
  };

  const handleSaveUsuario = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Nombre y email son requeridos');
      return;
    }

    if (!editingId && !formData.password) {
      toast.error('Contraseña es requerida para nuevos usuarios');
      return;
    }

    try {
      if (editingId) {
        // Actualizar usuario
        await request('put', `/usuarios/${editingId}`, {
          name: formData.name,
          email: formData.email,
          rol: formData.rol,
        });
        toast.success('Usuario actualizado exitosamente');
      } else {
        // Crear usuario
        await request('post', '/usuarios', formData);
        toast.success('Usuario creado exitosamente');
      }
      handleCloseModal();
      fetchUsuarios();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleEdit = (usuario) => {
    setEditingId(usuario.id);
    setFormData({
      name: usuario.name,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await request('delete', `/usuarios/${id}`);
        toast.success('Usuario eliminado exitosamente');
        fetchUsuarios();
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al eliminar usuario');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      rol: 'responsable',
    });
  };

  const getRolBadge = (rol) => {
    const variants = {
      admin: 'danger',
      almacen: 'primary',
      responsable: 'info',
      docente: 'success',
      auditor: 'warning',
    };
    return <Badge bg={variants[rol] || 'secondary'}>{String(rol).toUpperCase()}</Badge>;
  };

  if (loading && usuarios.length === 0) return <LoadingSpinner />;

  return (
    <Container fluid>
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="fw-bold">👥 Usuarios del Sistema</h1>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', email: '', password: '', rol: 'responsable' });
              setShowModal(true);
            }}
          >
            ➕ Nuevo Usuario
          </Button>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold">Buscar usuario</Form.Label>
                <Form.Control
                  placeholder="Buscar por nombre o email..."
                  onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold">Filtrar por rol</Form.Label>
                <Form.Select 
                  value={filtros.rol}
                  onChange={(e) => setFiltros({ ...filtros, rol: e.target.value })}
                >
                  <option value="">Todos los roles</option>
                  <option value="admin">Admin</option>
                  <option value="almacen">Almacén</option>
                  <option value="responsable">Responsable</option>
                  <option value="docente">Docente</option>
                  <option value="auditor">Auditor</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla */}
      <Card>
        <Card.Header>
          <strong>Listado de Usuarios ({usuarios.length})</strong>
        </Card.Header>
        <Card.Body>
          {usuarios && usuarios.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Carrera</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td><strong>{usuario.name || '-'}</strong></td>
                      <td>{usuario.email || '-'}</td>
                      <td>{getRolBadge(usuario.rol)}</td>
                      <td>{usuario.carrera?.nombre || '-'}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleEdit(usuario)}
                        >
                          ✏️ Editar
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(usuario.id)}
                        >
                          🗑️ Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No hay usuarios registrados</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo *</Form.Label>
              <Form.Control 
                placeholder="Ej: Juan Pérez García"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control 
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </Form.Group>

            {!editingId && (
              <Form.Group className="mb-3">
                <Form.Label>Contraseña *</Form.Label>
                <Form.Control 
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Rol *</Form.Label>
              <Form.Select 
                value={formData.rol}
                onChange={(e) => setFormData({...formData, rol: e.target.value})}
              >
                <option value="admin">🔴 Admin - Control total del sistema</option>
                <option value="almacen">🔵 Almacén - Gestión de inventario</option>
                <option value="responsable">⚫ Responsable - Responsable de items</option>
                <option value="docente">🟢 Docente - Acceso a consultas</option>
                <option value="auditor">🟡 Auditor - Auditoría y reportes</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveUsuario} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              editingId ? '✏️ Actualizar Usuario' : '➕ Crear Usuario'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
