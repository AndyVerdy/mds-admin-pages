import { useCallback, useMemo, useState } from "react";
import {
  createCondition,
  createGroup,
  defaultOperator,
  uid,
  countConditions,
  serializeToParams,
} from "./filterUtils";

/**
 * useFilterBuilder — manages filter tree state.
 *
 * @param {Array} fields - Array of field configs for this table
 * @returns filter state + mutation helpers
 */
export function useFilterBuilder(fields) {
  const [filterState, setFilterState] = useState({
    logic: "and",
    conditions: [],
  });

  // ── Add a condition to a specific group (or root) ──────────────────
  const addCondition = useCallback(
    (groupId = null) => {
      setFilterState((prev) => {
        const condition = createCondition(fields);
        if (!groupId) {
          return { ...prev, conditions: [...prev.conditions, condition] };
        }
        return updateNode(prev, groupId, (group) => ({
          ...group,
          conditions: [...group.conditions, condition],
        }));
      });
    },
    [fields]
  );

  // ── Add a nested group ─────────────────────────────────────────────
  const addGroup = useCallback(
    (parentGroupId = null) => {
      setFilterState((prev) => {
        const group = createGroup(fields);
        if (!parentGroupId) {
          return { ...prev, conditions: [...prev.conditions, group] };
        }
        return updateNode(prev, parentGroupId, (parent) => ({
          ...parent,
          conditions: [...parent.conditions, group],
        }));
      });
    },
    [fields]
  );

  // ── Remove a condition or group by ID ──────────────────────────────
  const removeCondition = useCallback((conditionId) => {
    setFilterState((prev) => removeNode(prev, conditionId));
  }, []);

  // ── Update a specific condition's field / operator / value ─────────
  const updateCondition = useCallback(
    (conditionId, updates) => {
      setFilterState((prev) =>
        updateNode(prev, conditionId, (node) => {
          const merged = { ...node, ...updates };
          // If field changed, reset operator + value
          if (updates.field && updates.field !== node.field) {
            const fieldConfig = fields.find((f) => f.key === updates.field);
            const type = fieldConfig?.type || "text";
            merged.operator = defaultOperator(type);
            merged.value = "";
          }
          return merged;
        })
      );
    },
    [fields]
  );

  // ── Toggle logic (and/or) for a group ──────────────────────────────
  const setGroupLogic = useCallback((groupId, logic) => {
    setFilterState((prev) => {
      if (!groupId) {
        return { ...prev, logic };
      }
      return updateNode(prev, groupId, (group) => ({ ...group, logic }));
    });
  }, []);

  // ── Set root logic ─────────────────────────────────────────────────
  const setRootLogic = useCallback((logic) => {
    setFilterState((prev) => ({ ...prev, logic }));
  }, []);

  // ── Clear all filters ──────────────────────────────────────────────
  const clearAll = useCallback(() => {
    setFilterState({ logic: "and", conditions: [] });
  }, []);

  // ── Active condition count ─────────────────────────────────────────
  const activeCount = useMemo(
    () => countConditions(filterState),
    [filterState]
  );

  // ── Has any active conditions (with values)? ────────────────────────
  const hasConditions = activeCount > 0;

  // ── Serialize to flat API params ───────────────────────────────────
  const apiParams = useMemo(
    () => serializeToParams(filterState, fields),
    [filterState, fields]
  );

  return {
    filterState,
    setFilterState,
    addCondition,
    addGroup,
    removeCondition,
    updateCondition,
    setGroupLogic,
    setRootLogic,
    clearAll,
    activeCount,
    hasConditions,
    apiParams,
  };
}

// ── Tree helpers ─────────────────────────────────────────────────────

function updateNode(tree, nodeId, updater) {
  if (tree.id === nodeId) return updater(tree);
  if (!tree.conditions) return tree;
  return {
    ...tree,
    conditions: tree.conditions.map((child) => {
      if (child.id === nodeId) return updater(child);
      if (child.type === "group") return updateNode(child, nodeId, updater);
      return child;
    }),
  };
}

function removeNode(tree, nodeId) {
  if (!tree.conditions) return tree;
  return {
    ...tree,
    conditions: tree.conditions
      .filter((child) => child.id !== nodeId)
      .map((child) => {
        if (child.type === "group") return removeNode(child, nodeId);
        return child;
      }),
  };
}
