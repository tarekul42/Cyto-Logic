from .lexer import BioLexer
from .parser import BioParser
from .semantic import SemanticAnalyzer
from .gate_mapper import BioGateMapper


class CompilerPipeline:
    def __init__(self):
        self._lexer_cls = BioLexer
        self._parser_cls = BioParser
        self._analyzer = SemanticAnalyzer()
        self._mapper = BioGateMapper()

    def run(self, source_code):
        tokens = self._lexer_cls(source_code).tokenize()
        ast = self._parser_cls(tokens).parse()
        messages = self._analyzer.analyze(ast)
        cir = self._mapper.map_circuit(ast, logic_statement=source_code)
        return cir, messages

    def run_with_ast(self, ast, source_code=None):
        messages = self._analyzer.analyze(ast)
        cir = self._mapper.map_circuit(ast, logic_statement=source_code)
        return cir, messages
