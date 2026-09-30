/**
 * Exports data to a CSV file and triggers a browser download.
 *
 * @param {string} filename - The desired download file name, ending with .csv
 * @param {Array<Object>} rows - The data objects to export
 * @param {Array<{ label: string, key?: string, accessor?: Function }>} columns - Columns configuration
 */
export function exportToCsv(filename, rows, columns) {
  if (!rows || !rows.length) {
    throw new Error("No data available to export");
  }

  // Header row
  const headers = columns.map((col) => `"${(col.label || "").replace(/"/g, '""')}"`);

  // Data rows
  const dataRows = rows.map((row) =>
    columns
      .map((col) => {
        let val;
        if (typeof col.accessor === "function") {
          val = col.accessor(row);
        } else if (col.key) {
          val = row[col.key];
        } else {
          val = "";
        }

        if (val === null || val === undefined) {
          val = "";
        } else if (typeof val === "object") {
          val = JSON.stringify(val);
        } else {
          val = String(val);
        }

        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csvContent = [headers.join(","), ...dataRows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
