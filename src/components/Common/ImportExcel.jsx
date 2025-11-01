import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export default function ImportExcel({ show, onHide, onImport, loading }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setError(null);

    // Validar tipo de archivo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError('Por favor, selecciona un archivo Excel o CSV válido');
      return;
    }

    setFile(selectedFile);

    // Leer y previsualizar
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        if (data.length === 0) {
          setError('El archivo está vacío');
          return;
        }

        setPreview(data.slice(0, 5)); // Mostrar primeras 5 filas
      } catch (error) {
        setError('Error al leer el archivo: ' + error.message);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Selecciona un archivo');
      return;
    }

    if (preview.length === 0) {
      toast.error('No hay datos en el archivo');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        await onImport(data);
        setFile(null);
        setPreview([]);
        setError(null);
      } catch (error) {
        setError('Error al importar datos: ' + error.message);
        toast.error('Error al importar datos');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>📥 Importar Datos desde Excel</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info" className="mb-3">
          <strong>📋 Instrucciones:</strong>
          <ul className="mb-0 mt-2">
            <li>Tu archivo debe estar en formato .xlsx, .xls o .csv</li>
            <li>La primera fila debe contener los nombres de las columnas</li>
            <li>Los datos se verificarán antes de importar</li>
          </ul>
        </Alert>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        <Form.Group className="mb-3">
          <Form.Label className="fw-bold">Seleccionar archivo Excel/CSV</Form.Label>
          <Form.Control
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
          />
          <Form.Text className="text-muted">
            Formatos soportados: Excel (.xlsx, .xls) y CSV
          </Form.Text>
        </Form.Group>

        {preview.length > 0 && (
          <div>
            <h6 className="fw-bold mb-2">✓ Vista previa (primeras 5 filas):</h6>
            <div className="table-responsive">
              <table className="table table-sm table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    {Object.keys(preview[0]).map(key => (
                      <th key={key} className="small fw-bold">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="small">
                          {val !== null && val !== undefined ? String(val) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Alert variant="success" className="mt-2">
              <strong>✓ Listo para importar:</strong> {preview.length} filas de vista previa
            </Alert>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleImport} 
          disabled={!file || preview.length === 0 || loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Importando...
            </>
          ) : (
            <>
              <Upload size={16} className="me-2" />
              Importar {preview.length} registros
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
