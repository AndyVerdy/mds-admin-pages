import { Plus, X } from "lucide-react";
import { Button } from "../ui/button";
import FilterCondition from "./FilterCondition";

/**
 * FilterGroup — a group of conditions connected by AND / OR.
 * Can be nested to create complex filters.
 */
export default function FilterGroup({
  group,
  fields,
  depth = 0,
  onAddCondition,
  onAddGroup,
  onRemoveCondition,
  onUpdateCondition,
  onSetGroupLogic,
  onRemoveGroup,
}) {
  const isRoot = depth === 0;

  return (
    <div
      className={
        isRoot
          ? "flex flex-col gap-2"
          : "flex flex-col gap-2 border border-dashed border-border rounded-lg p-3 bg-muted/30 relative"
      }
    >
      {/* Remove group button (not for root) */}
      {!isRoot && (
        <button
          onClick={() => onRemoveGroup(group.id)}
          className="absolute top-2 right-2 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {group.conditions.map((node, index) => (
        <div key={node.id} className="flex flex-col gap-2">
          {/* Logic connector between conditions (shown after first) */}
          {index > 0 && (
            <LogicToggle
              logic={group.logic}
              onChange={(logic) => onSetGroupLogic(isRoot ? null : group.id, logic)}
              disabled={index > 1} // only first connector is interactive
            />
          )}

          {/* Render condition or nested group */}
          {node.type === "group" ? (
            <FilterGroup
              group={node}
              fields={fields}
              depth={depth + 1}
              onAddCondition={onAddCondition}
              onAddGroup={onAddGroup}
              onRemoveCondition={onRemoveCondition}
              onUpdateCondition={onUpdateCondition}
              onSetGroupLogic={onSetGroupLogic}
              onRemoveGroup={onRemoveCondition}
            />
          ) : (
            <FilterCondition
              condition={node}
              fields={fields}
              onChange={onUpdateCondition}
              onRemove={onRemoveCondition}
            />
          )}
        </div>
      ))}

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
          onClick={() => onAddCondition(isRoot ? null : group.id)}
        >
          <Plus className="w-3 h-3" />
          Add filter rule
        </Button>
        {depth < 2 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
            onClick={() => onAddGroup(isRoot ? null : group.id)}
          >
            <Plus className="w-3 h-3" />
            Add filter group
          </Button>
        )}
      </div>
    </div>
  );
}

// ── AND / OR toggle ──────────────────────────────────────────────────
function LogicToggle({ logic, onChange, disabled }) {
  return (
    <div className="flex items-center gap-1 pl-1">
      <button
        onClick={() => !disabled && onChange(logic === "and" ? "or" : "and")}
        className={`
          text-xs font-medium px-2 py-0.5 rounded-md transition-colors
          ${disabled ? "cursor-default" : "cursor-pointer hover:bg-muted"}
          ${logic === "and" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-orange-50 text-orange-700 border border-orange-200"}
        `}
      >
        {logic.toUpperCase()}
      </button>
    </div>
  );
}
