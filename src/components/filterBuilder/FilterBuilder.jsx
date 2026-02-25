import { ListFilter, X } from "lucide-react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import FilterGroup from "./FilterGroup";
import { useFilterBuilder } from "./useFilterBuilder";
import { countConditions } from "./filterUtils";

/**
 * FilterBuilder — a reusable, per-table advanced filter component.
 *
 * Props:
 *   fields         – array of { key, label, type, options?, accessor?, apiParam? }
 *   filterState    – current filter state (from useFilterBuilder)
 *   onFilterChange – called with new filter state
 *   onClear        – called when all filters are cleared
 *
 * If you want uncontrolled usage, omit filterState/onFilterChange and use
 * the `useFilterBuilder` hook externally.
 */
export default function FilterBuilder({
  fields,
  filterState,
  addCondition,
  addGroup,
  removeCondition,
  updateCondition,
  setGroupLogic,
  setRootLogic,
  clearAll,
  activeCount,
}) {
  const count = activeCount ?? countConditions(filterState);
  const hasFilters = filterState?.conditions?.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-9 gap-1.5 text-sm font-normal ${
            count > 0
              ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              : ""
          }`}
        >
          <ListFilter className="w-4 h-4" />
          Filters
          {count > 0 && (
            <span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-blue-600 text-white text-[10px] font-semibold px-1">
              {count}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto min-w-[500px] max-w-[700px] p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-sm font-medium">Filter by</span>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          {hasFilters ? (
            <FilterGroup
              group={filterState}
              fields={fields}
              depth={0}
              onAddCondition={addCondition}
              onAddGroup={addGroup}
              onRemoveCondition={removeCondition}
              onUpdateCondition={updateCondition}
              onSetGroupLogic={setGroupLogic}
              onRemoveGroup={removeCondition}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-sm text-muted-foreground">
                No filters applied
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-sm gap-1.5"
                onClick={() => addCondition(null)}
              >
                <ListFilter className="w-3.5 h-3.5" />
                Add a filter
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
