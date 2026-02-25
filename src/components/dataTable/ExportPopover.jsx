import React, { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ── helpers ──────────────────────────────────────────────────────────
function getExportableColumns(table, onlyVisible) {
  const allCols = table.getAllColumns();
  const cols = onlyVisible ? table.getVisibleLeafColumns() : allCols;
  // exclude utility columns (checkbox, actions)
  return cols.filter(
    (c) =>
      c.id !== "select" &&
      c.id !== "actions" &&
      c.columnDef.accessorKey // must have data key
  );
}

function getExportRows(table, onlySelected) {
  if (onlySelected) {
    return table.getSelectedRowModel().rows.map((r) => r.original);
  }
  // all rows on current page
  return table.getRowModel().rows.map((r) => r.original);
}

function resolveValue(row, col) {
  // Use custom export accessor if provided (for nested/computed data)
  if (col.columnDef.meta?.exportValue) {
    const val = col.columnDef.meta.exportValue(row);
    if (val === null || val === undefined) return "";
    return String(val);
  }
  const key = col.columnDef.accessorKey;
  if (!key) return "";
  // walk dot-paths like "user_id.email"
  const val = key.split(".").reduce((o, k) => o?.[k], row);
  if (val === null || val === undefined) return "";
  return String(val);
}

function buildMatrix(rows, columns) {
  const headers = columns.map(
    (c) => c.columnDef.meta?.label || c.columnDef.header || c.id
  );
  const body = rows.map((row) => columns.map((col) => resolveValue(row, col)));
  return [headers, ...body];
}

// ── export functions ─────────────────────────────────────────────────
function exportCSV(matrix, filename) {
  const csv = matrix
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell).replace(/"/g, '""');
          return /[,"\n]/.test(str) ? `"${str}"` : str;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  saveAs(blob, `${filename}.csv`);
}

function exportExcel(matrix, filename) {
  const ws = XLSX.utils.aoa_to_sheet(matrix);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${filename}.xlsx`);
}

// ── component ────────────────────────────────────────────────────────
export default function ExportPopover({ table, row = "data" }) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState("csv"); // "csv" | "xlsx"
  const [colMode, setColMode] = useState("visible"); // "all" | "visible"
  const [rowMode, setRowMode] = useState("all"); // "all" | "selected"

  const hasSelection =
    table.getSelectedRowModel().rows.length > 0;

  const handleExport = () => {
    const columns = getExportableColumns(table, colMode === "visible");
    const rows = getExportRows(table, rowMode === "selected");

    if (rows.length === 0) return;

    const matrix = buildMatrix(rows, columns);
    const filename = `${row}-export-${new Date().toISOString().slice(0, 10)}`;

    if (format === "csv") {
      exportCSV(matrix, filename);
    } else {
      exportExcel(matrix, filename);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="!shadow-none">
          <Download className="w-4 h-4" /> Export
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[280px] !p-0"
        onInteractOutside={() => setOpen(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h4 className="text-sm font-semibold">Export</h4>
        </div>

        <div className="px-4 pb-4 space-y-4">
          {/* Format */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Format
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setFormat("csv")}
                className={`flex-1 flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors
                  ${
                    format === "csv"
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border hover:bg-muted/50"
                  }`}
              >
                <FileText className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => setFormat("xlsx")}
                className={`flex-1 flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors
                  ${
                    format === "xlsx"
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border hover:bg-muted/50"
                  }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>

          {/* Columns */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Columns
            </p>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  className="!rounded-full"
                  checked={colMode === "visible"}
                  onCheckedChange={() => setColMode("visible")}
                />
                <span className="text-sm">Only visible columns</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  className="!rounded-full"
                  checked={colMode === "all"}
                  onCheckedChange={() => setColMode("all")}
                />
                <span className="text-sm">All columns</span>
              </label>
            </div>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Rows
            </p>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  className="!rounded-full"
                  checked={rowMode === "all"}
                  onCheckedChange={() => setRowMode("all")}
                />
                <span className="text-sm">All rows on current page</span>
              </label>
              <label
                className={`flex items-center gap-2 ${
                  hasSelection
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-40"
                }`}
              >
                <Checkbox
                  className="!rounded-full"
                  checked={rowMode === "selected"}
                  disabled={!hasSelection}
                  onCheckedChange={() => {
                    if (hasSelection) setRowMode("selected");
                  }}
                />
                <span className="text-sm">
                  Only selected rows
                  {hasSelection &&
                    ` (${table.getSelectedRowModel().rows.length})`}
                </span>
              </label>
            </div>
          </div>

          {/* Export button */}
          <Button onClick={handleExport} className="w-full" size="sm">
            <Download className="w-4 h-4 mr-1.5" />
            Export {format === "csv" ? "CSV" : "Excel"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
