import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Order } from '@/types/apiResponses';
import { formatCurrency, formatDate } from './format';

// Add the missing type definition for jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Export order as PDF
 * @param order - The order to export
 */
export const exportOrderAsPDF = (order: Order) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(`Order Receipt #${order.id}`, 14, 22);
  
  // Add order info
  doc.setFontSize(12);
  doc.text(`Date: ${formatDate(order.created_at, 'full')}`, 14, 32);
  doc.text(`Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`, 14, 38);
  doc.text(`Total Amount: ${formatCurrency(parseFloat(order.total_amount))}`, 14, 44);
  
  // Add shipping address if available
  if (order.shipping_address) {
    doc.text('Shipping Address:', 14, 54);
    doc.setFontSize(10);
    const addressLines = order.shipping_address.split('\n');
    addressLines.forEach((line, index) => {
      doc.text(line, 14, 60 + (index * 5));
    });
  }
  
  // Add payment info if available
  if (order.payment_method) {
    doc.setFontSize(12);
    doc.text(`Payment Method: ${order.payment_method}`, 14, 80);
    if (order.payment_status) {
      doc.text(`Payment Status: ${order.payment_status}`, 14, 86);
    }
  }
  
  // Add items table
  const tableColumn = ["Product", "Vendor", "Price", "Quantity", "Subtotal"];
  const tableRows = order.items.map(item => [
    item.product_name,
    item.vendor_name || 'Unknown',
    formatCurrency(parseFloat(item.unit_price.toString())),
    item.quantity.toString(),
    formatCurrency(parseFloat(item.unit_price.toString()) * item.quantity)
  ]);
  
  // Apply the autoTable plugin to the document
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 95,
    theme: 'striped',
    headStyles: { fillColor: [245, 166, 35], textColor: [0, 0, 0] },
    styles: { font: 'helvetica', fontSize: 10 },
    margin: { top: 95 }
  });
  
  // Add total at the bottom
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: ${formatCurrency(parseFloat(order.total_amount))}`, 150, finalY + 10, { align: 'right' });
  
  // Add footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your purchase!', 105, finalY + 20, { align: 'center' });
  doc.text('© 2025 bumibrew Platform', 105, finalY + 25, { align: 'center' });
  
  // Save the PDF
  doc.save(`order-receipt-${order.id}.pdf`);
};

/**
 * Export order as Excel
 * @param order - The order to export
 */
export const exportOrderAsExcel = (order: Order) => {
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([
    [`Order Receipt #${order.id}`],
    [],
    ['Date', formatDate(order.created_at, 'full')],
    ['Status', order.status.charAt(0).toUpperCase() + order.status.slice(1)],
    ['Total Amount', formatCurrency(parseFloat(order.total_amount))],
    [],
    ['Product', 'Vendor', 'Price', 'Quantity', 'Subtotal'],
    ...order.items.map(item => [
      item.product_name,
      item.vendor_name || 'Unknown',
      formatCurrency(parseFloat(item.unit_price.toString())),
      item.quantity,
      formatCurrency(parseFloat(item.unit_price.toString()) * item.quantity)
    ]),
    [],
    ['', '', '', 'Total', formatCurrency(parseFloat(order.total_amount))]
  ]);
  
  // Set column widths
  const wscols = [
    { wch: 40 }, // Product
    { wch: 20 }, // Vendor
    { wch: 15 }, // Price
    { wch: 10 }, // Quantity
    { wch: 15 }  // Subtotal
  ];
  ws['!cols'] = wscols;
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Order Receipt');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save the file
  saveAs(data, `order-receipt-${order.id}.xlsx`);
};

/**
 * Export order as CSV
 * @param order - The order to export
 */
export const exportOrderAsCSV = (order: Order) => {
  // Create worksheet with order items
  const ws = XLSX.utils.aoa_to_sheet([
    ['Order ID', 'Date', 'Status', 'Total Amount'],
    [
      order.id, 
      formatDate(order.created_at, 'full'), 
      order.status.charAt(0).toUpperCase() + order.status.slice(1),
      formatCurrency(parseFloat(order.total_amount))
    ],
    [],
    ['Product', 'Vendor', 'Price', 'Quantity', 'Subtotal'],
    ...order.items.map(item => [
      item.product_name,
      item.vendor_name || 'Unknown',
      formatCurrency(parseFloat(item.unit_price.toString())),
      item.quantity,
      formatCurrency(parseFloat(item.unit_price.toString()) * item.quantity)
    ])
  ]);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Order Receipt');
  
  // Generate CSV file
  const csvOutput = XLSX.utils.sheet_to_csv(ws);
  const data = new Blob([csvOutput], { type: 'text/csv;charset=utf-8' });
  
  // Save the file
  saveAs(data, `order-receipt-${order.id}.csv`);
};

/**
 * Export order in the specified format
 * @param order - The order to export
 * @param format - The export format ('pdf', 'excel', or 'csv')
 */
export const exportOrder = (order: Order, format: 'pdf' | 'excel' | 'csv') => {
  switch (format) {
    case 'pdf':
      exportOrderAsPDF(order);
      break;
    case 'excel':
      exportOrderAsExcel(order);
      break;
    case 'csv':
      exportOrderAsCSV(order);
      break;
    default:
      console.error('Unsupported export format');
  }
};
