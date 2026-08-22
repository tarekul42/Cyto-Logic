import type { Edge, Node } from "@xyflow/react";

export interface ValidationError {
  message: string;
  nodeId?: string;
}

export function validateCircuit(
  nodes: Node[],
  edges: Edge[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (nodes.length === 0) {
    errors.push({ message: "Circuit is empty — add at least one node" });
    return errors;
  }

  const outputNodes = nodes.filter((n) => n.data?.type === "OUTPUT");
  if (outputNodes.length === 0) {
    errors.push({
      message: "Circuit must have at least one OUTPUT node (reporter gene)",
    });
  }
  if (outputNodes.length > 1) {
    errors.push({
      message: `Found ${outputNodes.length} output nodes; only the first is used`,
    });
  }

  const inputNodes = nodes.filter((n) => n.data?.type === "INPUT");
  if (inputNodes.length === 0) {
    errors.push({
      message: "Circuit must have at least one INPUT node (inducer/regulator)",
    });
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  for (const edge of edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push({
        message: `Edge references source node "${edge.source}" which does not exist`,
      });
    }
    if (!nodeIds.has(edge.target)) {
      errors.push({
        message: `Edge references target node "${edge.target}" which does not exist`,
      });
    }
  }

  const orphanNodes = nodes.filter((n) => {
    const hasIncoming = edges.some((e) => e.target === n.id);
    const hasOutgoing = edges.some((e) => e.source === n.id);
    return !hasIncoming && !hasOutgoing && n.data?.type !== "INPUT";
  });
  for (const node of orphanNodes) {
    errors.push({
      message: `Node "${node.data?.label || node.id}" is disconnected`,
      nodeId: node.id,
    });
  }

  return errors;
}

export function hasCycle(edges: Edge[]): boolean {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
    adjacency.get(edge.source)!.push(edge.target);
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (inStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);
    inStack.add(nodeId);
    for (const neighbor of adjacency.get(nodeId) || []) {
      if (dfs(neighbor)) return true;
    }
    inStack.delete(nodeId);
    return false;
  }

  for (const nodeId of adjacency.keys()) {
    if (dfs(nodeId)) return true;
  }
  return false;
}
