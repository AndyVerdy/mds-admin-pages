import { X } from "lucide-react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { OPERATORS, NO_VALUE_OPERATORS } from "./filterUtils";

/**
 * FilterCondition — a single filter row:
 *   [Field] [Operator] [Value] [Remove]
 */
export default function FilterCondition({
  condition,
  fields,
  onChange,
  onRemove,
}) {
  const fieldConfig = fields.find((f) => f.key === condition.field);
  const fieldType = fieldConfig?.type || "text";
  const operators = OPERATORS[fieldType] || OPERATORS.text;
  const needsValue = !NO_VALUE_OPERATORS.includes(condition.operator);

  return (
    <div className="flex items-center gap-2">
      {/* Field select */}
      <Select
        value={condition.field}
        onValueChange={(val) => onChange(condition.id, { field: val })}
      >
        <SelectTrigger className="w-[160px] h-8 text-sm">
          <SelectValue placeholder="Select field" />
        </SelectTrigger>
        <SelectContent>
          {fields.map((f) => (
            <SelectItem key={f.key} value={f.key}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Operator select */}
      <Select
        value={condition.operator}
        onValueChange={(val) => onChange(condition.id, { operator: val })}
      >
        <SelectTrigger className="w-[150px] h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Value input — type depends on field */}
      {needsValue && (
        <FilterValueInput
          condition={condition}
          fieldConfig={fieldConfig}
          onChange={onChange}
        />
      )}

      {/* Remove button */}
      <button
        onClick={() => onRemove(condition.id)}
        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Dynamic value input based on field type ──────────────────────────
function FilterValueInput({ condition, fieldConfig, onChange }) {
  const type = fieldConfig?.type || "text";

  // Select fields → dropdown with options
  if (type === "select" && fieldConfig?.options?.length > 0) {
    return (
      <Select
        value={condition.value || ""}
        onValueChange={(val) => onChange(condition.id, { value: val })}
      >
        <SelectTrigger className="w-[160px] h-8 text-sm">
          <SelectValue placeholder="Select value" />
        </SelectTrigger>
        <SelectContent>
          {fieldConfig.options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Date fields
  if (type === "date") {
    if (condition.operator === "between") {
      const [from, to] = (condition.value || ",").split(",");
      return (
        <div className="flex items-center gap-1">
          <Input
            type="date"
            value={from || ""}
            onChange={(e) =>
              onChange(condition.id, {
                value: `${e.target.value},${to || ""}`,
              })
            }
            className="w-[130px] h-8 text-sm"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={to || ""}
            onChange={(e) =>
              onChange(condition.id, {
                value: `${from || ""},${e.target.value}`,
              })
            }
            className="w-[130px] h-8 text-sm"
          />
        </div>
      );
    }
    return (
      <Input
        type="date"
        value={condition.value || ""}
        onChange={(e) => onChange(condition.id, { value: e.target.value })}
        className="w-[160px] h-8 text-sm"
      />
    );
  }

  // Number fields
  if (type === "number") {
    if (condition.operator === "between") {
      const [min, max] = (condition.value || ",").split(",");
      return (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={min || ""}
            placeholder="Min"
            onChange={(e) =>
              onChange(condition.id, {
                value: `${e.target.value},${max || ""}`,
              })
            }
            className="w-[80px] h-8 text-sm"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="number"
            value={max || ""}
            placeholder="Max"
            onChange={(e) =>
              onChange(condition.id, {
                value: `${min || ""},${e.target.value}`,
              })
            }
            className="w-[80px] h-8 text-sm"
          />
        </div>
      );
    }
    return (
      <Input
        type="number"
        value={condition.value || ""}
        placeholder="Value"
        onChange={(e) => onChange(condition.id, { value: e.target.value })}
        className="w-[120px] h-8 text-sm"
      />
    );
  }

  // Default: text input
  return (
    <Input
      type="text"
      value={condition.value || ""}
      placeholder="Value"
      onChange={(e) => onChange(condition.id, { value: e.target.value })}
      className="w-[160px] h-8 text-sm"
    />
  );
}
