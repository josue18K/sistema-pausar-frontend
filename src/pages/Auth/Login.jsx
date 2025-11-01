import { useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useApi } from '../../hooks/useApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, Moon, Sun } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@instituto.edu.pe');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const { request, loading } = useApi();
  const { isDark, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      const response = await request('post', '/login', { email, password });
      setToken(response.token);
      setUser(response.user);
      toast.success('¡Bienvenido!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error en el login');
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: isDark 
          ? 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
      data-bs-theme={isDark ? 'dark' : 'light'}
    >
      {/* Decorative Elements */}
      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', backgroundColor: '#003d7a', opacity: 0.1, borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', backgroundColor: '#e67e22', opacity: 0.1, borderRadius: '50%' }} />

      {/* Theme Toggle */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
        <Button
          onClick={toggleTheme}
          variant="outline-secondary"
          size="lg"
          className="border-0 p-3"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#003d7a',
            color: 'white',
            borderRadius: '50%'
          }}
        >
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </Button>
      </div>

      <Container className="flex-grow-1 d-flex align-items-center" style={{ maxWidth: '500px', position: 'relative', zIndex: 1 }}>
        <Row className="w-100">
          <Col xs={12}>
            <Card 
              className="border-0 shadow-lg"
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                border: '3px solid #003d7a'
              }}
            >
              <Card.Body className="p-5">
                {/* Logo */}
                <div className="text-center mb-4">
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: '#003d7a',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '48px',
                      margin: '0 auto 20px',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 20px rgba(0, 61, 122, 0.3)'
                    }}
                  >
                    🏫
                  </div>
                  <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 8px 0', color: '#003d7a', textTransform: 'uppercase' }}>
                    PAUSAR
                  </h1>
                  <p style={{ fontSize: '13px', opacity: 0.7, margin: 0, fontWeight: '700' }}>
                    Instituto de Educación Superior Tecnológico Público
                  </p>
                </div>

                <hr style={{ opacity: 0.2, margin: '28px 0' }} />

                <Form onSubmit={handleSubmit}>
                  {/* Email */}
                  <Form.Group className="mb-4">
                    <Form.Label style={{ fontSize: '13px', fontWeight: '900', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#003d7a' }}>
                      📧 Correo Electrónico
                    </Form.Label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999', zIndex: 1 }} />
                      <Form.Control
                        type="email"
                        placeholder="admin@instituto.edu.pe"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ paddingLeft: '45px', fontSize: '15px' }}
                      />
                    </div>
                  </Form.Group>

                  {/* Password */}
                  <Form.Group className="mb-4">
                    <Form.Label style={{ fontSize: '13px', fontWeight: '900', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#003d7a' }}>
                      🔒 Contraseña
                    </Form.Label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999', zIndex: 1 }} />
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Ingrese su contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ paddingLeft: '45px', paddingRight: '45px', fontSize: '15px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          zIndex: 1,
                          color: '#999',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </Form.Group>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    className="w-100 fw-bold py-3"
                    variant="primary"
                    style={{
                      marginBottom: '16px',
                      fontSize: '16px',
                      backgroundColor: '#003d7a',
                      borderColor: '#003d7a',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      boxShadow: '0 6px 16px rgba(0, 61, 122, 0.3)'
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Iniciando...
                      </>
                    ) : (
                      '🚀 INGRESAR'
                    )}
                  </Button>

                  {/* Forgot Password */}
                  <div className="text-center">
                    <a href="#" style={{ fontSize: '13px', textDecoration: 'none', color: '#003d7a', fontWeight: '700' }}>
                      ¿Olvidó su contraseña?
                    </a>
                  </div>
                </Form>

                <hr style={{ opacity: 0.2, margin: '28px 0' }} />

                {/* Demo Info */}
                <Alert 
                  variant="info"
                  className="mb-0"
                  style={{
                    fontSize: '13px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}
                >
                  <strong>📋 Datos de Demo:</strong>
                  <div className="mt-2">
                    <small>📧 Email: <code>admin@instituto.edu.pe</code></small>
                    <br />
                    <small>🔑 Clave: <code>password123</code></small>
                  </div>
                </Alert>
              </Card.Body>
            </Card>

            {/* Footer */}
            <div className="text-center mt-4" style={{ fontSize: '12px', opacity: 0.6, fontWeight: '700' }}>
              <p style={{ margin: 0 }}>🏫 Instituto de Educación Superior Tecnológico Público PAUSAR</p>
              <p style={{ margin: '4px 0 0 0' }}>© 2024 Todos los derechos reservados</p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
