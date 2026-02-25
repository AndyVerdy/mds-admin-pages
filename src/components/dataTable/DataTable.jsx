import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { ArrowDown, ArrowUp, ChevronDown, GripVertical, Trash } from "lucide-react";
import ExportPopover from "./ExportPopover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DataTablePagination } from "./DataTablePagination";
import { ClipLoader } from "react-spinners";
import { Checkbox } from "../ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import TableEmptyState from "./TableEmptyState";

// --- Draggable Table Header Cell ---
function DraggableTableHead({ header, children, className }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: header.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className={`${className} cursor-grab active:cursor-grabbing`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-1.5">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 opacity-0 group-hover/th:opacity-100 transition-opacity" />
        <div className="flex-1">{children}</div>
      </div>
    </TableHead>
  );
}


const DataTable = ({
  columns,
  data = [],
  row = "row",
  onBulkDelete,
  // handleExport - removed, export is now built-in via ExportPopover
  pagination,
  loading,
  error,
  bulkActions = true,
  paginationState,
  setPaginationState = () => {},
  sorting = [],
  setSorting = () => {},
  onRowClick = () => {},
  onClearFilters = () => {},
  showExport = true,
  showColumnVisibility = true,
  showPagination = true,
  fetchAllRows,
  enableColumnReorder = true,
  columnVisibility: externalColumnVisibility,
  setColumnVisibility: externalSetColumnVisibility,
}) => {
  const [columnFilters, setColumnFilters] = useState([]);
  const [internalColumnVisibility, setInternalColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);

  const columnVisibility =
    externalColumnVisibility ?? internalColumnVisibility;
  const setColumnVisibility =
    externalSetColumnVisibility ?? setInternalColumnVisibility;

  function prependColumns(optionalColumns, baseColumns) {
    return [...optionalColumns.filter(Boolean), ...baseColumns];
  }

  const optionalColumns = [
    bulkActions && {
      id: "select",
      header: ({ table }) => (
        <label className="!max-w-8 !w-full !h-full flex items-center justify-center cursor-pointer">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);
            }}
            aria-label="Select all"
            className="pointer-events-none"
          />
        </label>
      ),
      cell: ({ row }) => (
        <label className="!max-w-8 !w-full h-full flex items-center justify-center cursor-pointer">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
            }}
            aria-label="Select row"
            className="pointer-events-none"
          />
        </label>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const finalColumns = prependColumns(optionalColumns, columns).map((col) => {
    const originalLabel =
      typeof col.header === "string" ? col.header : col.id || col.accessorKey;
    const colWithMeta = {
      ...col,
      meta: {
        ...col.meta,
        label: originalLabel,
      },
    };

    if (col.enableSorting && typeof col.header !== "function") {
      return {
        ...colWithMeta,
        header: ({ column }) =>
          column.getCanSort() ? (
            <div className="!p-0 flex items-center group">
              <p className="!text-muted-foreground !text-left !align-middle !font-medium !whitespace-nowrap !text-sm !mr-1">
                {typeof col.header === "string" ? col.header : column.id}
              </p>
              <button
                className={`hover:bg-[#F5F5F4] !opacity-0 group-hover:!opacity-100 focus:!outline-none
                  focus:!border-[#000] focus:!border !w-7 flex !items-center !justify-center !h-7 !rounded-md
                  ${sorting.length > 0 && col.accessorKey === sorting[0]?.id ? "!opacity-100" : "!opacity-0"}`}
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                {column.getIsSorted() === "asc" ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ArrowDown className="!w-4 !h-4 !text-[#18181B]" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8} arrow={false}>
                      <span className="!text-sm text-white">Reverse sort</span>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <ArrowUp className="!w-4 !h-4 !text-[#18181B]" />
                )}
              </button>
            </div>
          ) : typeof col.header === "string" ? (
            col.header
          ) : (
            column.id
          ),
      };
    }
    return colWithMeta;
  });

  // Initialize column order when columns change
  useEffect(() => {
    if (finalColumns.length > 0 && columnOrder.length === 0) {
      setColumnOrder(finalColumns.map((c) => c.id || c.accessorKey));
    }
  }, [finalColumns.length]); // eslint-disable-line

  const table = useReactTable({
    data,
    columns: finalColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.action || row.id || row._id,
    manualPagination: true,
    pageCount: pagination?.totalPages,
    rowCount: pagination?.itemsPerPage,
    onPaginationChange: setPaginationState,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnOrderChange: setColumnOrder,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: paginationState,
      columnOrder,
    },
  });

  useEffect(() => {
    if (bulkActions) {
      const selectedData = table
        .getSelectedRowModel()
        .rows.map((r) => r.original);
      setSelectedRows(selectedData);
    }
  }, [rowSelection, table, bulkActions]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor)
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setColumnOrder((prev) => {
      const oldIndex = prev.indexOf(active.id);
      const newIndex = prev.indexOf(over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  // Column IDs for the sortable context (only reorderable columns)
  const columnIds = useMemo(
    () => columnOrder.filter((id) => id !== "select" && id !== "actions"),
    [columnOrder]
  );

  // Show loading state
  if (loading && (!data || data.length === 0)) {
    return (
      <div className="flex-1 w-full h-full">
        <div className="flex items-center justify-center min-h-60">
          <ClipLoader
            color={"#000"}
            loading={true}
            size={20}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      </div>
    );
  }

  // Show error state
  if (error && (!data || data.length === 0)) {
    return (
      <div className="flex-1 w-full h-full">
        <div className="flex flex-col items-center justify-center gap-4 p-20 w-full flex-grow">
          <div className="flex flex-col items-center justify-center gap-2">
            <h3 className="text-xl font-semibold">Failed to load data</h3>
            <p className="text-sm text-muted-foreground">
              {error?.status === 401 || error?.status === 403
                ? "Authentication failed. Please check your auth token."
                : "Something went wrong. Please try again."}
            </p>
          </div>
          <Button onClick={onClearFilters} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!loading && (!pagination?.totalItems || pagination.totalItems === 0)) {
    return (
      <div className="flex-1 w-full h-full">
        <TableEmptyState onClearFilters={onClearFilters} />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full">
      <div className="flex sm:!flex-row flex-col sm:!items-center !items-start justify-between mb-3 sm:gap-4 gap-2">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">
            {selectedRows?.length > 0
              ? `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} ${row}(s) selected`
              : `${pagination?.totalItems || 0} ${row}${pagination?.totalItems > 1 ? "s" : ""}`}
          </h3>
          {selectedRows?.length > 0 && (
            <Button
              variant="outline"
              onClick={() => onBulkDelete?.(selectedRows, setSelectedRows)}
            >
              <Trash /> Delete
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {showExport && (
            <ExportPopover table={table} row={row} fetchAllRows={fetchAllRows} />
          )}
          {showColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="!shadow-none">
                <Button variant="outline" className="ml-auto self-end">
                  Columns <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const label =
                      column.columnDef.meta?.label || column.id;
                    const capitalizedLabel =
                      label.charAt(0).toUpperCase() + label.slice(1);
                    return (
                      <label
                        key={column.id}
                        className="flex !items-center hover:bg-[#f5f5f5] rounded-md !gap-2 !py-[6px] !pl-2 !pr-8 cursor-pointer"
                      >
                        <Checkbox
                          className="!rounded-xs"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        />
                        <span className="!font-normal !text-sm !leading-5">
                          {capitalizedLabel}
                        </span>
                      </label>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <div className="w-full h-full overflow-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={columnIds}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => {
                      const isReorderable =
                        enableColumnReorder &&
                        header.id !== "select" &&
                        header.id !== "actions";

                      if (isReorderable) {
                        return (
                          <DraggableTableHead
                            key={header.id}
                            header={header}
                            className={`group/th ${header.column.columnDef.meta?.headerClassName || ""}`}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </DraggableTableHead>
                        );
                      }

                      return (
                        <TableHead
                          key={header.id}
                          className={header.column.columnDef.meta?.headerClassName}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <tr>
                  <td colSpan={finalColumns?.length}>
                    <div className="flex !w-full items-center justify-center min-h-60">
                      <ClipLoader
                        color={"#000"}
                        loading={loading}
                        size={20}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    onClick={(e) => {
                      const tag = e.target.tagName.toLowerCase();
                      if (
                        tag === "a" ||
                        tag === "button" ||
                        tag === "img" ||
                        tag === "label" ||
                        tag === "div" ||
                        e.target.closest("a") ||
                        e.target.closest("button")
                      ) {
                        return;
                      }
                      onRowClick(row, e);
                    }}
                    key={row.id}
                    className={`${row.getIsSelected() && "bg-muted/50"}`}
                  >
                        {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DndContext>
        {showPagination && pagination?.totalItems > 10 && (
          <DataTablePagination
            table={table}
            paginationState={paginationState}
            setPaginationState={setPaginationState}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(DataTable);
