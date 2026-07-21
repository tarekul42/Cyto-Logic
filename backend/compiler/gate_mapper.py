from .ir_builder import IRBuilder


class BioGateMapper:
    def __init__(self):
        self._builder = None

    def map_circuit(self, circuit_ast, logic_statement=None):
        if circuit_ast is None:
            raise ValueError("Cannot map a null circuit AST.")

        self._builder = IRBuilder(logic_statement=logic_statement)
        return self._builder.build(circuit_ast)