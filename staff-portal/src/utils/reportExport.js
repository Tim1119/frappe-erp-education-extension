import * as XLSX from "xlsx";

function csvEscape(value) {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCSVString(columns, rows) {
  const header = columns.map((c) => csvEscape(c.label || c.fieldname)).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => csvEscape(row[c.fieldname])).join(","),
  );
  return [header, ...lines].join("\r\n");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(filename, columns, rows) {
  const csv = toCSVString(columns, rows);
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename);
}

export function toSheetRows(columns, rows) {
  return rows.map((row) => {
    const obj = {};
    columns.forEach((c) => {
      obj[c.label || c.fieldname] = row[c.fieldname] ?? "";
    });
    return obj;
  });
}

export function exportToXLSX(filename, columns, rows) {
  const sheetRows = toSheetRows(columns, rows);
  const worksheet = XLSX.utils.json_to_sheet(sheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, filename);
}
