/**
 * Filter utilities — operators, matching logic, and serialization.
 */

// ── Operator definitions per field type ──────────────────────────────
export const OPERATORS = {
  text: [
    { value: "contains", label: "contains" },
    { value: "not_contains", label: "does not contain" },
    { value: "equals", label: "is" },
    { value: "not_equals", label: "is not" },
    { value: "starts_with", label: "starts with" },
    { value: "ends_with", label: "ends with" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ],
  number: [
    { value: "equals", label: "=" },
    { value: "not_equals", label: "≠" },
    { value: "gt", label: ">" },
    { value: "gte", label: "≥" },
    { value: "lt", label: "<" },
    { value: "lte", label: "≤" },
    { value: "between", label: "between" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ],
  date: [
    { value: "equals", label: "is" },
    { value: "before", label: "is before" },
    { value: "after", label: "is after" },
    { value: "between", label: "is between" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ],
  select: [
    { value: "equals", label: "is" },
    { value: "not_equals", label: "is not" },
    { value: "is_any_of", label: "is any of" },
    { value: "is_none_of", label: "is none of" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ],
  boolean: [
    { value: "is_true", label: "is true" },
    { value: "is_false", label: "is false" },
  ],
};

// ── Operators that require no value input ────────────────────────────
export const NO_VALUE_OPERATORS = [
  "is_empty",
  "is_not_empty",
  "is_true",
  "is_false",
];

// ── Generate a unique ID ─────────────────────────────────────────────
let _counter = 0;
export function uid() {
  return `f_${Date.now()}_${++_counter}`;
}

// ── Create a blank condition ─────────────────────────────────────────
export function createCondition(fields) {
  const first = fields?.[0];
  const type = first?.type || "text";
  const ops = OPERATORS[type] || OPERATORS.text;
  return {
    id: uid(),
    field: first?.key || "",
    operator: ops[0]?.value || "contains",
    value: "",
  };
}

// ── Create a blank group ─────────────────────────────────────────────
export function createGroup(fields) {
  return {
    id: uid(),
    type: "group",
    logic: "and",
    conditions: [createCondition(fields)],
  };
}

// ── Get default operator for a field type ────────────────────────────
export function defaultOperator(fieldType) {
  const ops = OPERATORS[fieldType] || OPERATORS.text;
  return ops[0]?.value || "contains";
}

// ── Match a single value against a condition ─────────────────────────
function matchCondition(cellValue, operator, filterValue) {
  // Normalize
  const cv =
    cellValue == null ? "" : String(cellValue).toLowerCase().trim();
  const fv =
    filterValue == null ? "" : String(filterValue).toLowerCase().trim();

  switch (operator) {
    // Text
    case "contains":
      return cv.includes(fv);
    case "not_contains":
      return !cv.includes(fv);
    case "equals":
      return cv === fv;
    case "not_equals":
      return cv !== fv;
    case "starts_with":
      return cv.startsWith(fv);
    case "ends_with":
      return cv.endsWith(fv);
    case "is_empty":
      return cv === "";
    case "is_not_empty":
      return cv !== "";

    // Number
    case "gt":
      return Number(cellValue) > Number(filterValue);
    case "gte":
      return Number(cellValue) >= Number(filterValue);
    case "lt":
      return Number(cellValue) < Number(filterValue);
    case "lte":
      return Number(cellValue) <= Number(filterValue);
    case "between": {
      const num = Number(cellValue);
      const [min, max] = (filterValue || "").split(",").map(Number);
      return num >= min && num <= max;
    }

    // Date
    case "before":
      return new Date(cellValue) < new Date(filterValue);
    case "after":
      return new Date(cellValue) > new Date(filterValue);

    // Select multi
    case "is_any_of": {
      const vals = Array.isArray(filterValue)
        ? filterValue
        : String(filterValue).split(",");
      return vals.some((v) => String(v).toLowerCase().trim() === cv);
    }
    case "is_none_of": {
      const vals = Array.isArray(filterValue)
        ? filterValue
        : String(filterValue).split(",");
      return !vals.some((v) => String(v).toLowerCase().trim() === cv);
    }

    // Boolean
    case "is_true":
      return cellValue === true || cv === "true" || cv === "1" || cv === "yes";
    case "is_false":
      return (
        cellValue === false || cv === "false" || cv === "0" || cv === "no" || cv === ""
      );

    default:
      return true;
  }
}

// ── Resolve a cell value from a row using a field config ─────────────
export function resolveCellValue(row, fieldConfig) {
  if (fieldConfig.accessor) {
    return fieldConfig.accessor(row);
  }
  // Dot-path fallback (e.g. "user_id.display_name")
  const parts = fieldConfig.key.split(".");
  let val = row;
  for (const p of parts) {
    val = val?.[p];
  }
  return val;
}

// ── Evaluate a filter tree against a single row ──────────────────────
export function evaluateFilter(row, filterState, fieldsMap) {
  if (!filterState || !filterState.conditions?.length) return true;

  const results = filterState.conditions.map((node) => {
    if (node.type === "group") {
      return evaluateFilter(row, node, fieldsMap);
    }
    // Skip incomplete conditions (no value and not a no-value operator)
    if (!NO_VALUE_OPERATORS.includes(node.operator) && !node.value) {
      return true; // pass through
    }
    // Single condition
    const fieldConfig = fieldsMap[node.field];
    if (!fieldConfig) return true; // unknown field → pass
    const cellValue = resolveCellValue(row, fieldConfig);
    return matchCondition(cellValue, node.operator, node.value);
  });

  return filterState.logic === "and"
    ? results.every(Boolean)
    : results.some(Boolean);
}

// ── Apply the full filter tree to an array of rows ───────────────────
export function applyFilters(rows, filterState, fields) {
  if (!filterState?.conditions?.length) return rows;
  const fieldsMap = Object.fromEntries(fields.map((f) => [f.key, f]));
  return rows.filter((row) => evaluateFilter(row, filterState, fieldsMap));
}

// ── Count the total active conditions in a filter tree ───────────────
export function countConditions(filterState) {
  if (!filterState?.conditions?.length) return 0;
  return filterState.conditions.reduce((count, node) => {
    if (node.type === "group") return count + countConditions(node);
    // Only count conditions that have a value (or use no-value operators)
    if (NO_VALUE_OPERATORS.includes(node.operator) || node.value) {
      return count + 1;
    }
    return count;
  }, 0);
}

// ── Serialize filter state to flat API params ────────────────────────
// Maps filter conditions to simple key-value params for server-side use.
// Only works for simple single-value conditions.
export function serializeToParams(filterState, fields) {
  const params = {};
  if (!filterState?.conditions?.length) return params;

  const fieldsMap = Object.fromEntries(fields.map((f) => [f.key, f]));

  for (const node of filterState.conditions) {
    if (node.type === "group") continue; // nested groups can't become flat params
    const fieldConfig = fieldsMap[node.field];
    if (!fieldConfig?.apiParam) continue; // no API mapping
    if (NO_VALUE_OPERATORS.includes(node.operator)) continue;
    if (!node.value) continue;

    // Simple mapping
    if (node.operator === "equals" || node.operator === "contains") {
      params[fieldConfig.apiParam] = node.value;
    }
  }

  return params;
}
