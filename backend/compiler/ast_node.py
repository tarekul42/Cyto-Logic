class ASTNode:
    pass

class ProteinNode(ASTNode):
    def __init__(self, name, strand="+"):
        self.name = name
        self.strand = strand

    def __repr__(self):
        return f"Protein({self.name}, strand={self.strand!r})"

class NotGate(ASTNode):
    def __init__(self, input_node, strand="+"):
        self.input = input_node
        self.strand = strand

    def __repr__(self):
        return f"NOT({self.input}, strand={self.strand!r})"

class AndGate(ASTNode):
    def __init__(self, left, right, strand="+"):
        self.left = left
        self.right = right
        self.strand = strand

    def __repr__(self):
        return f"({self.left} AND {self.right}, strand={self.strand!r})"

class OrGate(ASTNode):
    def __init__(self, left, right, strand="+"):
        self.left = left
        self.right = right
        self.strand = strand

    def __repr__(self):
        return f"({self.left} OR {self.right}, strand={self.strand!r})"

class Circuit(ASTNode):
    def __init__(self, condition, output):
        self.condition = condition
        self.output = output

    def __repr__(self):
        return f"CIRCUIT: IF {self.condition} -> THEN EXPRESS {self.output}"