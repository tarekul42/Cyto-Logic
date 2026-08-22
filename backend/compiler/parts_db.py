from .knowledge_base import (
    get_biomolecules,
    get_gates,
    get_reporters,
    get_additional_parts,
    get_regulatory_map,
    get_part,
    reload,
)

BIOMOLECULES = get_biomolecules()
GATES_DB = get_gates()
REPORTERS = get_reporters()
ADDITIONAL_PARTS = get_additional_parts()
REGULATORY_MAP = get_regulatory_map()


def refresh():
    reload()
    global BIOMOLECULES, GATES_DB, REPORTERS, ADDITIONAL_PARTS, REGULATORY_MAP
    BIOMOLECULES = get_biomolecules()  # pyright: ignore[reportConstantRedefinition]
    GATES_DB = get_gates()  # pyright: ignore[reportConstantRedefinition]
    REPORTERS = get_reporters()  # pyright: ignore[reportConstantRedefinition]
    ADDITIONAL_PARTS = get_additional_parts()  # pyright: ignore[reportConstantRedefinition]
    REGULATORY_MAP = get_regulatory_map()  # pyright: ignore[reportConstantRedefinition]


if __name__ == "__main__":
    print("--- BioBrick Parts Database Test (from Knowledge Base) ---")
    repressor_name = "TetR"
    if repressor_name in BIOMOLECULES:
        part_info = BIOMOLECULES[repressor_name]
        print(f"Intermediate Repressor [{repressor_name}] -> iGEM ID: {part_info['id']} ({part_info['info']})")
    print("\nNOT Gate Backbone Parts:")
    for part in GATES_DB["NOT"]:
        print(f"  Role: {part['role']:<12} -> iGEM ID: {part['id']}")