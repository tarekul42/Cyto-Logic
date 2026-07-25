class ASTNode:
    pass

class ProteinNode(ASTNode):
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f"Protein({self.name})"

class NotGate(ASTNode):
    # NOT always operates on one operand
    def __init__(self, input_node):
        self.input = input_node

    def __repr__(self):
        return f"NOT({self.input})"

class AndGate(ASTNode):
    def __init__(self, left, right):
        self.left = left
        self.right = right

    def __repr__(self):
        return f"({self.left} AND {self.right})"

class OrGate(ASTNode):
    def __init__(self, left, right):
        self.left = left
        self.right = right

    def __repr__(self):
        return f"({self.left} OR {self.right})"

class Circuit(ASTNode):
    def __init__(self, condition, output):
        self.condition = condition
        self.output = output

    def __repr__(self):
        return f"CIRCUIT: IF {self.condition} -> THEN EXPRESS {self.output}"