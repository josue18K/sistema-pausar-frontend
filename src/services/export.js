import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const headerColor = [37, 99, 235];
const accentColor = [30, 64, 175];
const lightGray = [248, 249, 250];

const addHeader = (doc, title) => {
  // Fondo azul
  doc.setFillColor(...headerColor);
  doc.rect(0, 0, 210, 35, 'F');

  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text(title, 14, 22);

  // Línea decorativa
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(1);
  doc.line(14, 28, 196, 28);

  // Reset text color
  doc.setTextColor(0, 0, 0);
};

const addFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageSize = doc.internal.pageSize;
  const pageHeight = pageSize.getHeight();

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generado: ${new Date().toLocaleDateString('es-ES')} - ${new Date().toLocaleTimeString('es-ES')}`,
    14,
    pageHeight - 10
  );
  doc.text(
    `Página ${doc.internal.getNumberOfPages()}`,
    pageSize.getWidth() - 30,
    pageHeight - 10
  );
};

const addSummaryBoxes = (doc, startY, data) => {
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(50, 50, 50);

  const boxWidth = 40;
  const boxHeight = 18;
  const spacing = 12;

  let x = 14;

  Object.entries(data).forEach(([label, value], index) => {
    // Fondo de la caja
    doc.setFillColor(...lightGray);
    doc.rect(x, startY, boxWidth, boxHeight, 'F');

    // Borde
    doc.setDrawColor(...headerColor);
    doc.setLineWidth(0.5);
    doc.rect(x, startY, boxWidth, boxHeight);

    // Etiqueta
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.text(label, x + 2, startY + 4);

    // Valor
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...headerColor);
    doc.text(String(value), x + 2, startY + 12);

    x += boxWidth + spacing;

    // Si necesita nueva fila
    if ((index + 1) % 4 === 0) {
      x = 14;
      startY += boxHeight + spacing;
    }
  });

  return startY + boxHeight + spacing;
};

export const exportarItemsExcel = (items) => {
  const data = items.map(item => ({
    Código: item.codigo,
    Nombre: item.nombre,
    Categoría: item.categoria?.nombre || '-',
    Laboratorio: item.laboratorio?.nombre || '-',
    Estado: item.estado,
    Valor: `S/. ${item.valor?.toFixed(2) || '0.00'}`,
    'Fecha de Adquisición': item.fecha_adquisicion ? new Date(item.fecha_adquisicion).toLocaleDateString('es-ES') : '-',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  
  // Ancho de columnas
  ws['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Items');
  XLSX.writeFile(wb, `Reporte_Items_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportarItemsPDF = (items) => {
  const doc = new jsPDF();

  addHeader(doc, '📦 REPORTE DE ITEMS');

  // Información general
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Institución: Instituto Tecnológico`, 14, 40);
  doc.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 46);

  // Cajas resumen
  const activeItems = items.filter(i => i.estado === 'activo').length;
  const maintenanceItems = items.filter(i => i.estado === 'mantenimiento').length;
  const discardedItems = items.filter(i => i.estado === 'baja').length;

  const summaryStartY = addSummaryBoxes(doc, 52, {
    'Total Items': items.length,
    'Activos': activeItems,
    'Mantenimiento': maintenanceItems,
    'Baja': discardedItems,
  });

  // Tabla
  const tableData = items.map(item => [
    item.codigo || '-',
    item.nombre || '-',
    item.categoria?.nombre || '-',
    item.laboratorio?.nombre || '-',
    item.estado?.toUpperCase() || '-',
    `S/. ${item.valor?.toFixed(2) || '0.00'}`,
  ]);

  autoTable(doc, {
    head: [['Código', 'Nombre', 'Categoría', 'Laboratorio', 'Estado', 'Valor']],
    body: tableData,
    startY: summaryStartY + 5,
    theme: 'grid',
    headStyles: {
      fillColor: headerColor,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
    },
  });

  addFooter(doc);
  doc.save(`Reporte_Items_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportarConsumiblesExcel = (consumibles) => {
  const data = consumibles.map(item => ({
    Nombre: item.nombre,
    Categoría: item.categoria?.nombre || '-',
    'Stock Actual': item.stock,
    'Stock Mínimo': item.stock_minimo,
    Unidad: item.unidad_medida,
    Estado: item.stock <= item.stock_minimo ? 'BAJO' : 'OK',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Consumibles');
  XLSX.writeFile(wb, `Reporte_Consumibles_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportarConsumiblesPDF = (consumibles) => {
  const doc = new jsPDF();

  addHeader(doc, '📫 REPORTE DE CONSUMIBLES');

  // Información general
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Institución: Instituto Tecnológico`, 14, 40);
  doc.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 46);

  // Cajas resumen
  const stockBajoCount = consumibles.filter(c => c.stock <= c.stock_minimo).length;
  const stockOkCount = consumibles.length - stockBajoCount;

  const summaryStartY = addSummaryBoxes(doc, 52, {
    'Total': consumibles.length,
    'Stock OK': stockOkCount,
    'Stock Bajo': stockBajoCount,
    'Alerta': '⚠️',
  });

  // Tabla
  const tableData = consumibles.map(item => [
    item.nombre || '-',
    item.categoria?.nombre || '-',
    item.stock || 0,
    item.stock_minimo || 0,
    item.unidad_medida || '-',
    item.stock <= item.stock_minimo ? '⚠️ CRÍTICO' : '✓ NORMAL',
  ]);

  autoTable(doc, {
    head: [['Nombre', 'Categoría', 'Stock Actual', 'Stock Mín.', 'Unidad', 'Estado']],
    body: tableData,
    startY: summaryStartY + 5,
    theme: 'grid',
    headStyles: {
      fillColor: headerColor,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    didDrawCell: (data) => {
      // Resaltar filas con stock bajo
      if (data.row.index >= 0) {
        const consumible = consumibles[data.row.index];
        if (consumible.stock <= consumible.stock_minimo) {
          doc.setFillColor(255, 200, 200);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`Reporte_Consumibles_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportarMovimientosExcel = (movimientos) => {
  const data = movimientos.map(item => ({
    'Item/Consumible': item.item?.nombre || item.consumible?.nombre || '-',
    Tipo: item.tipo,
    Cantidad: item.cantidad,
    Usuario: item.usuario?.name || '-',
    Observaciones: item.observaciones || '-',
    Fecha: new Date(item.created_at).toLocaleDateString('es-ES'),
    Hora: new Date(item.created_at).toLocaleTimeString('es-ES'),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 20 },
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Movimientos');
  XLSX.writeFile(wb, `Reporte_Movimientos_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportarMovimientosPDF = (movimientos) => {
  const doc = new jsPDF();

  addHeader(doc, '🔄 REPORTE DE MOVIMIENTOS');

  // Información general
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Institución: Instituto Tecnológico`, 14, 40);
  doc.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 46);

  // Cajas resumen
  const entradas = movimientos.filter(m => m.tipo === 'entrada').length;
  const salidas = movimientos.filter(m => m.tipo === 'salida').length;
  const mantenimiento = movimientos.filter(m => m.tipo === 'mantenimiento').length;
  const baja = movimientos.filter(m => m.tipo === 'baja').length;

  const summaryStartY = addSummaryBoxes(doc, 52, {
    'Total': movimientos.length,
    'Entradas': entradas,
    'Salidas': salidas,
    'Mantenimiento': mantenimiento,
  });

  // Tabla
  const tableData = movimientos.map(item => [
    item.item?.nombre || item.consumible?.nombre || '-',
    item.tipo?.toUpperCase() || '-',
    item.cantidad || '-',
    item.usuario?.name || '-',
    item.observaciones || '-',
    new Date(item.created_at).toLocaleDateString('es-ES'),
  ]);

  autoTable(doc, {
    head: [['Item/Consumible', 'Tipo', 'Cant.', 'Usuario', 'Observaciones', 'Fecha']],
    body: tableData,
    startY: summaryStartY + 5,
    theme: 'grid',
    headStyles: {
      fillColor: headerColor,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`Reporte_Movimientos_${new Date().toISOString().split('T')[0]}.pdf`);
};
