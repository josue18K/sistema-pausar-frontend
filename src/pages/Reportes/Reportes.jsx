import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Spinner } from 'react-bootstrap';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  exportarItemsExcel, 
  exportarItemsPDF,
  exportarConsumiblesExcel,
  exportarConsumiblesPDF,
  exportarMovimientosExcel,
  exportarMovimientosPDF
} from '../../services/export';

export default function Reportes() {
  const [reportType, setReportType] = useState('items');
  const [reportData, setReportData] = useState(null);
  const [estadisticas, setEstadisticas] = useState({});
  const [items, setItems] = useState([]);
  const [consumibles, setConsumibles] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const { request, loading } = useApi();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // Cargar items
      const itemsRes = await request('get', '/items');
      setItems(itemsRes.data.data || []);

      // Cargar consumibles
      const consumiblesRes = await request('get', '/consumibles');
      setConsumibles(consumiblesRes.data.data || []);

      // Cargar movimientos
      const movimientosRes = await request('get', '/movimientos');
      setMovimientos(movimientosRes.data.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar datos');
    }
  };

  const generateReport = async () => {
    try {
      if (reportType === 'items') {
        const response = await request('get', '/items-estadisticas');
        setReportData(response.data || {});
        setEstadisticas(response.data || {});
      } else if (reportType === 'consumibles') {
        const response = await request('get', '/consumibles-estadisticas');
        setReportData(response.data || {});
        setEstadisticas(response.data || {});
      } else if (reportType === 'movimientos') {
        const response = await request('get', '/movimientos-estadisticas');
        setReportData(response.data || {});
        setEstadisticas(response.data || {});
      }
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar reporte');
    }
  };

  const handleDownloadExcel = () => {
    try {
      if (reportType === 'items') {
        exportarItemsExcel(items);
      } else if (reportType === 'consumibles') {
        exportarConsumiblesExcel(consumibles);
      } else if (reportType === 'movimientos') {
        exportarMovimientosExcel(movimientos);
      }
      toast.success('Archivo Excel descargado');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al descargar Excel');
    }
  };

  const handleDownloadPDF = () => {
    try {
      if (reportType === 'items') {
        exportarItemsPDF(items);
      } else if (reportType === 'consumibles') {
        exportarConsumiblesPDF(consumibles);
      } else if (reportType === 'movimientos') {
        exportarMovimientosPDF(movimientos);
      }
      toast.success('Archivo PDF descargado');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al descargar PDF');
    }
  };

  return (
    <Container fluid>
      <h1 className="mb-4 fw-bold">📊 Reportes</h1>

      {/* Opciones de Reporte */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold">Tipo de Reporte</Form.Label>
                <Form.Select 
                  value={reportType}
                  onChange={(e) => {
                    setReportType(e.target.value);
                    setReportData(null);
                  }}
                >
                  <option value="items">📦 Items - Inventario</option>
                  <option value="consumibles">📫 Consumibles - Stock</option>
                  <option value="movimientos">🔄 Movimientos - Historial</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={8} className="d-flex align-items-end gap-2 flex-wrap">
              <Button 
                variant="primary" 
                onClick={generateReport} 
                disabled={loading}
                className="flex-grow-1"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Generando...
                  </>
                ) : (
                  '🔄 Generar Reporte'
                )}
              </Button>
              <Button 
                variant="success" 
                onClick={handleDownloadExcel}
                disabled={!reportData}
                className="flex-grow-1"
              >
                📥 Excel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDownloadPDF}
                disabled={!reportData}
                className="flex-grow-1"
              >
                📄 PDF
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Contenido del Reporte */}
      {reportData ? (
        <Card>
          <Card.Header>
            <strong>
              {reportType === 'items' && '📦 Reporte de Items'}
              {reportType === 'consumibles' && '📫 Reporte de Consumibles'}
              {reportType === 'movimientos' && '🔄 Reporte de Movimientos'}
            </strong>
          </Card.Header>
          <Card.Body>
            {reportType === 'items' && (
              <Row>
                <Col md={3} className="mb-3">
                  <Card className="text-center border-0 shadow-sm bg-light">
                    <Card.Body>
                      <p className="text-muted small mb-2">Total Items</p>
                      <h2 className="text-primary fw-bold">{estadisticas.total_items || 0}</h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} className="mb-3">
                  <Card className="text-center border-0 shadow-sm bg-light">
                    <Card.Body>
                      <p className="text-muted small mb-2">Items Activos</p>
                      <h2 className="text-success fw-bold">{estadisticas.items_activos || 0}</h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} className="mb-3">
                  <Card className="text-center border-0 shadow-sm bg-light">
                    <Card.Body>
                      <p className="text-muted small mb-2">En Mantenimiento</p>
                      <h2 className="text-warning fw-bold">{estadisticas.items_mantenimiento || 0}</h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} className="mb-3">
                  <Card className="text-center border-0 shadow-sm bg-light">
                    <Card.Body>
                      <p className="text-muted small mb-2">Baja</p>
                      <h2 className="text-danger fw-bold">{estadisticas.items_baja || 0}</h2>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {reportType === 'consumibles' && (
              <Row>
                <Col md={4} className="mb-3">
                  <Card className="text-center border-0 shadow-sm bg-light">
                    <Card.Body>
                      <p className="text-muted small mb-2">Total Consumibles</p>
                      <h2 className="text-primary fw-bold">{estadisticas.total_consumibles || 0}</h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4} className="mb-3">
                  <Card className="text-center border-0 shadow-sm bg-light">
                    <Card.Body>
                      <p className="text-muted small mb-2">Stock Adecuado</p>
                      <h2 className="text-success fw-bold">{estadisticas.stock_adecuado || 0}</h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4} className="mb-3">
                  <Card className="text-center border-0 shadow-sm bg-light">
                    <Card.Body>
                      <p className="text-muted small mb-2">Stock Bajo</p>
                      <h2 className="text-danger fw-bold">{estadisticas.stock_bajo || 0}</h2>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {reportType === 'movimientos' && (
              <Row>
                <Col md={3} className="mb-3">
                  <Card className="text-center border-0 shadow-sm bg-light">
                    <Card.Body>
                      <p className="text-muted small mb-2">Total Movimientos</p>
                      <h2 className="text-primary fw-bold">{estadisticas.total_movimientos || 0}</h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} className="mb-3">
                  <Card className="text-center border-0 shadow-sm bg-light">
                    <Card.Body>
                      <p className="text-muted small mb-2">Entradas</p>
                      <h2 className="text-success fw-bold">{estadisticas.movimientos_entrada || 0}</h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} className="mb-3">
                  <Card className="text-center border-0 shadow-sm bg-light">
                    <Card.Body>
                      <p className="text-muted small mb-2">Salidas</p>
                      <h2 className="text-warning fw-bold">{estadisticas.movimientos_salida || 0}</h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} className="mb-3">
                  <Card className="text-center border-0 shadow-sm bg-light">
                    <Card.Body>
                      <p className="text-muted small mb-2">Mantenimiento</p>
                      <h2 className="text-info fw-bold">{estadisticas.movimientos_mantenimiento || 0}</h2>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            <hr />

            <div className="text-center text-muted">
              <p className="small mb-0">
                📅 Reporte generado: {new Date().toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="small">
                💾 Descarga los reportes en formato Excel o PDF haciendo clic en los botones arriba
              </p>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-muted mb-0">
              Selecciona un tipo de reporte y haz clic en "Generar Reporte" para visualizar los datos
            </p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
