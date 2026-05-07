import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export function exportToExcel(
  columns: ExportColumn[],
  rows: Record<string, unknown>[],
  filename: string,
  sheetName = "Sheet1"
) {
  const header = columns.map((c) => c.header);
  const data = rows.map((row) => columns.map((c) => row[c.key] ?? ""));
  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

  const colWidths = columns.map((c) => ({ wch: c.width ?? 18 }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPDF(
  title: string,
  subtitle: string,
  columns: ExportColumn[],
  rows: Record<string, unknown>[],
  filename: string
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title, 14, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(subtitle, 14, 23);
  doc.text(`Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, 14, 29);
  doc.setTextColor(0, 0, 0);

  const head = [columns.map((c) => c.header)];
  const body = rows.map((row) =>
    columns.map((c) => {
      const v = row[c.key];
      return v === null || v === undefined ? "" : String(v);
    })
  );

  autoTable(doc, {
    head,
    body,
    startY: 34,
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: [248, 255, 250] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${filename}.pdf`);
}
