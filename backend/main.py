from compiler.lexer import BioLexer
from compiler.parser import BioParser
from compiler.gate_mapper import BioGateMapper

def run_compiler(source_code):
    print(f"--- Compiling Code: '{source_code}' ---\n")
    lexer = BioLexer(source_code)
    try:
        tokens = lexer.tokenize()
        print("[STEP 1] Tokenization Successful!")
        print(f"Tokens: {tokens}\n")
    except Exception as e:
        print(f"[ERROR] Lexing failed: {e}")
        return

    parser = BioParser(tokens)
    try:
        ast_tree = parser.parse()
        print("[STEP 2] Parsing Successful! (AST Generated)")
        print(f"AST Tree structure: {ast_tree}\n")
    except SyntaxError as e:
        print(f"[SYNTAX ERROR] Parsing failed: {e}")
        return
    except Exception as e:
        print(f"[ERROR] Parsing failed: {e}")
        return

    mapper = BioGateMapper()
    try:
        result = mapper.map_circuit(ast_tree)
        print("[STEP 3] Gate Mapping & DNA Synthesis Successful!\n")

        print("==================================================")
        print("          GENERATED BIOLOGICAL PLASMID MAP        ")
        print("==================================================")
        
        print(f"Circuit Complexity Score: {result['complexity']}")
        print("\nSynthesized DNA BioBrick Sequence:")

        # Parts ordered 5'->3' as they'd appear on the assembled construct
        for index, part in enumerate(result["dna_parts_list"], 1):
            role_upper = part["role"].upper()
            print(f"  {index}. [{role_upper:<10}] -> ID: {part['id']:<12} | Info: {part['info']}")
            
        print("==================================================")
        
    except Exception as e:
        print(f"[ERROR] Mapping failed: {e}")
        return


if __name__ == "__main__":
    sample_program = "IF (aTc AND AraC) -> GFP"
    run_compiler(sample_program)