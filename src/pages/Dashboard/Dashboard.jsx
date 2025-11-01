import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { useApi } from '../../hooks/useApi';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [activities, setActivities] = useState([]);
  const { request, loading } = useApi();
  const { isDark } = useTheme();

  useEffect(() => {
    fetchDashboard();
    fetchActivities();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await request('get', '/dashboard');
      setDashboard(response.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar dashboard');
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await request('get', '/movimientos');
      setActivities(response.data.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!dashboard) return <LoadingSpinner />;

  const kpis = dashboard.kpis || {};
  const textColor = isDark ? '#ecf0f1' : '#1a1a1a';
  const gridColor = isDark ? '#34495e' : '#ddd';

  const estadosData = [
    { name: 'Activos', value: kpis.items_activos || 0 },
    { name: 'Mantenimiento', value: kpis.items_mantenimiento || 0 },
    { name: 'Bajas', value: kpis.items_bajas || 0 },
  ];

  const kpiCards = [
    { title: 'Inventario Total', value: kpis.items_totales || 0, icon: '📦', color: '#003d7a', bg: '#d1e7f7' },
    { title: 'En Mantenimiento', value: kpis.items_mantenimiento || 0, icon: '🔧', color: '#d97706', bg: '#fed7aa' },
    { title: 'Stock Bajo', value: kpis.consumibles_stock_bajo || 0, icon: '⚠️', color: '#e74c3c', bg: '#fadbd8' },
    { title: 'Movimientos', value: activities.length, icon: '🚀', color: '#27ae60', bg: '#d5f4e6' },
  ];

  const chartColors = ['#27ae60', '#d97706', '#e74c3c'];

  return (
    <div style={{ paddingBottom: '40px' }}>
      <Container fluid>
        {/* Header */}
        <div className="mb-4">
          <h1 style={{ fontSize: '36px', fontWeight: '900', margin: 0, marginBottom: '8px', color: '#003d7a', textTransform: 'uppercase' }}>
            📊 Dashboard
          </h1>
          <p style={{ opacity: 0.6, fontSize: '15px', margin: 0, fontWeight: '700' }}>
            Instituto de Educación Superior Tecnológico Público PAUSAR
          </p>
        </div>

        {/* KPI Cards */}
        <Row className="mb-4" style={{ marginLeft: '-8px', marginRight: '-8px' }}>
          {kpiCards.map((kpi, idx) => (
            <Col lg={3} md={6} sm={6} key={idx} className="mb-3" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
              <div className="kpi-card" style={{ borderColor: kpi.color, backgroundColor: isDark ? undefined : kpi.bg }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p className="kpi-label" style={{ color: kpi.color }}>{kpi.title}</p>
                    <p className="kpi-value" style={{ color: kpi.color }}>
                      {kpi.value}
                    </p>
                  </div>
                  <div style={{ fontSize: '48px' }}>{kpi.icon}</div>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Charts Row */}
        <Row className="mb-4" style={{ marginLeft: '-8px', marginRight: '-8px' }}>
          {/* Pie Chart */}
          <Col lg={6} className="mb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
            <Card className="h-100 border-0" style={{ borderTop: '4px solid #003d7a' }}>
              <Card.Body>
                <h5 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 24px 0', color: '#003d7a', textTransform: 'uppercase' }}>
                  🥧 Estado de Items
                </h5>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={estadosData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {estadosData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDark ? '#1a1f3a' : '#ffffff',
                        border: `3px solid #003d7a`,
                        borderRadius: '8px',
                        color: textColor
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>

          {/* Bar Chart */}
          <Col lg={6} className="mb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
            <Card className="h-100 border-0" style={{ borderTop: '4px solid #e67e22' }}>
              <Card.Body>
                <h5 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 24px 0', color: '#e67e22', textTransform: 'uppercase' }}>
                  📊 Items por Categoría
                </h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboard.items_por_categoria || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="nombre" stroke={textColor} />
                    <YAxis stroke={textColor} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDark ? '#1a1f3a' : '#ffffff',
                        border: `3px solid #e67e22`,
                        borderRadius: '8px',
                        color: textColor
                      }}
                    />
                    <Bar dataKey="total" fill="#003d7a" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Bottom Row */}
        <Row style={{ marginLeft: '-8px', marginRight: '-8px' }}>
          {/* Categorías Grid */}
          <Col lg={8} className="mb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
            <Card className="h-100 border-0" style={{ borderLeft: '4px solid #27ae60' }}>
              <Card.Body>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h5 style={{ fontSize: '18px', fontWeight: '900', margin: 0, marginBottom: '4px', color: '#27ae60', textTransform: 'uppercase' }}>
                      🏆 Items por Categoría
                    </h5>
                    <small style={{ opacity: 0.6, fontWeight: '700' }}>Distribución del inventario</small>
                  </div>
                  <Badge bg="success" style={{ fontSize: '12px', padding: '6px 12px', textTransform: 'uppercase' }}>
                    +5.2% 📈
                  </Badge>
                </div>

                <Row>
                  {dashboard.items_por_categoria?.map((cat, idx) => (
                    <Col md={6} key={idx} className="mb-3">
                      <div
                        style={{
                          backgroundColor: isDark ? '#1a1f3a' : '#e8f4f8',
                          borderRadius: '14px',
                          padding: '20px',
                          textAlign: 'center',
                          border: `3px solid #003d7a`
                        }}
                      >
                        <h3 style={{ color: '#003d7a', fontWeight: '900', fontSize: '28px', margin: 0 }}>
                          {cat.total}
                        </h3>
                        <p style={{ fontSize: '14px', opacity: 0.8, margin: '8px 0 0 0', fontWeight: '700' }}>
                          {cat.nombre}
                        </p>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Actividad Reciente */}
          <Col lg={4} className="mb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
            <Card className="h-100 border-0" style={{ borderRight: '4px solid #e67e22' }}>
              <Card.Body>
                <h5 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 24px 0', color: '#e67e22', textTransform: 'uppercase' }}>
                  ⚡ Actividad Reciente
                </h5>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {activities.length > 0 ? (
                    activities.map((activity, idx) => (
                      <div
                        key={idx}
                        style={{
                          paddingBottom: '14px',
                          marginBottom: '14px',
                          borderBottom: idx < activities.length - 1 ? `2px solid ${isDark ? '#34495e' : '#ddd'}` : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ fontSize: '28px', flexShrink: 0 }}>
                            {activity.tipo === 'entrada' ? '📥' : activity.tipo === 'salida' ? '📤' : '📋'}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '14px', fontWeight: '700', margin: 0, marginBottom: '4px' }}>
                              {activity.item?.nombre || activity.consumible?.nombre || 'Item'}
                            </p>
                            <small style={{ opacity: 0.6, fontWeight: '600' }}>Hace 2 horas</small>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ textAlign: 'center', opacity: 0.6, fontWeight: '700' }}>
                      📭 Sin actividad
                    </p>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
