from .ast_node import ProteinNode, NotGate, AndGate, OrGate, Circuit
from .parts_db import GATES_DB, BIOMOLECULES, REPORTERS
from .cir import CircuitIR

GATE_IMPL_MAP = {
    "NOT": {
        "aTc": "TetR",
        "AraC": "LacI",
    },
}


class IRBuilder:
    def __init__(self, logic_statement=None):
        self.logic_statement = logic_statement or ""
        self._counter = 0

    def build(self, circuit_ast):
        ir = CircuitIR(
            logic_statement=self.logic_statement,
            output_protein=circuit_ast.output.name,
        )

        self._traverse(circuit_ast.condition, ir)

        out_name = circuit_ast.output.name
        if out_name in REPORTERS:
            ir.add_part(
                REPORTERS[out_name]["id"],
                REPORTERS[out_name]["role"],
                REPORTERS[out_name]["info"],
            )
        else:
            ir.add_part(
                "BBa_CUSTOM_CDS",
                "CDS",
                f"Custom CDS for {out_name}",
            )

        return ir

    def _next_id(self):
        nid = f"gate_{self._counter}"
        self._counter += 1
        return nid

    def _traverse(self, node, ir):
        if node is None:
            return None

        current_id = self._next_id()

        if isinstance(node, ProteinNode):
            node_info = {"label": node.name, "type": "input"}
            if node.name in BIOMOLECULES:
                node_info["biopart_id"] = BIOMOLECULES[node.name]["id"]
            ir.set_node(current_id, node_info)
            return current_id

        elif isinstance(node, NotGate):
            child_id = self._traverse(node.input, ir)
            ir.set_node(current_id, {"label": "NOT", "type": "gate"})
            if child_id:
                ir.add_edge(child_id, current_id)
            for part in GATES_DB["NOT"]:
                ir.add_part(part["id"], part["role"], part["info"])
            input_name = (
                node.input.name
                if isinstance(node.input, ProteinNode)
                else None
            )
            repressor_key = GATE_IMPL_MAP.get("NOT", {}).get(input_name, "TetR")
            if repressor_key in BIOMOLECULES:
                r = BIOMOLECULES[repressor_key]
                ir.add_part(r["id"], r["role"], r["info"])
            return current_id

        elif isinstance(node, AndGate):
            left_id = self._traverse(node.left, ir)
            right_id = self._traverse(node.right, ir)
            ir.add_node(current_id, "AND", "gate")
            if left_id:
                ir.add_edge(left_id, current_id)
            if right_id:
                ir.add_edge(right_id, current_id)
            for part in GATES_DB["AND"]:
                ir.add_part(part["id"], part["role"], part["info"])
            return current_id

        elif isinstance(node, OrGate):
            left_id = self._traverse(node.left, ir)
            right_id = self._traverse(node.right, ir)
            ir.add_node(current_id, "OR", "gate")
            if left_id:
                ir.add_edge(left_id, current_id)
            if right_id:
                ir.add_edge(right_id, current_id)
            for part in GATES_DB["OR"]:
                ir.add_part(part["id"], part["role"], part["info"])
            return current_id

        return None
