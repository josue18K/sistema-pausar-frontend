import { Form, Row, Col, Button } from 'react-bootstrap';
import { Search, RotateCcw } from 'lucide-react';

export default function SearchFilter({ 
  filters, 
  onFilterChange, 
  onReset, 
  filterOptions = {} 
}) {
  return (
    <Form>
      <Row>
        {filterOptions.search && (
          <Col md={filterOptions.search.span || 3} className="mb-3">
            <Form.Group>
              <Form.Label className="small fw-bold">
                {filterOptions.search.label}
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={18} />
                </span>
                <Form.Control
                  placeholder={filterOptions.search.placeholder}
                  value={filters.search || ''}
                  onChange={(e) => onFilterChange('search', e.target.value)}
                />
              </div>
            </Form.Group>
          </Col>
        )}

        {filterOptions.estado && (
          <Col md={filterOptions.estado.span || 3} className="mb-3">
            <Form.Group>
              <Form.Label className="small fw-bold">
                {filterOptions.estado.label}
              </Form.Label>
              <Form.Select
                value={filters.estado || ''}
                onChange={(e) => onFilterChange('estado', e.target.value)}
              >
                <option value="">Todos</option>
                {filterOptions.estado.options.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        )}

        {filterOptions.rol && (
          <Col md={filterOptions.rol.span || 3} className="mb-3">
            <Form.Group>
              <Form.Label className="small fw-bold">
                {filterOptions.rol.label}
              </Form.Label>
              <Form.Select
                value={filters.rol || ''}
                onChange={(e) => onFilterChange('rol', e.target.value)}
              >
                <option value="">Todos</option>
                {filterOptions.rol.options.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        )}

        {filterOptions.categoria && (
          <Col md={filterOptions.categoria.span || 3} className="mb-3">
            <Form.Group>
              <Form.Label className="small fw-bold">
                {filterOptions.categoria.label}
              </Form.Label>
              <Form.Select
                value={filters.categoria_id || ''}
                onChange={(e) => onFilterChange('categoria_id', e.target.value)}
              >
                <option value="">Todas</option>
                {filterOptions.categoria.options.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        )}

        {filterOptions.stock_status && (
          <Col md={filterOptions.stock_status.span || 3} className="mb-3">
            <Form.Group>
              <Form.Label className="small fw-bold">
                {filterOptions.stock_status.label}
              </Form.Label>
              <Form.Select
                value={filters.stock_status || ''}
                onChange={(e) => onFilterChange('stock_status', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="bajo">Stock Bajo</option>
                <option value="critico">Stock Crítico</option>
                <option value="normal">Stock Normal</option>
              </Form.Select>
            </Form.Group>
          </Col>
        )}

        <Col md={filterOptions.actions?.span || 2} className="mb-3 d-flex align-items-end gap-2">
          <Button
            variant="outline-secondary"
            onClick={onReset}
            className="w-100"
          >
            <RotateCcw size={16} className="me-2" />
            Limpiar
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
