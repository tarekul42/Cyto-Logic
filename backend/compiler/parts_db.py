# Input molecules and regulatory proteins
BIOMOLECULES = {
    "aTc": {
        "id": "BBa_K145001", 
        "role": "inducer", 
        "info": "Anhydrotetracycline - induces TetR promoter"
    },
    "AraC": {
        "id": "BBa_I13458", 
        "role": "regulatory_protein", 
        "info": "Arabinose regulatory protein"
    },
    "IPTG": {
        "id": "BBa_K145000",
        "role": "inducer",
        "info": "IPTG - induces LacI promoter"
    },
    "HSL": {
        "id": "BBa_C0061",
        "role": "inducer",
        "info": "AHL quorum sensing signal (3OC6HSL)"
    },
    
    "TetR": {
        "id": "BBa_C0040", 
        "role": "CDS", 
        "info": "TetR repressor protein coding sequence"
    },
    "LacI": {
        "id": "BBa_C0012", 
        "role": "CDS", 
        "info": "LacI repressor protein coding sequence"
    },
    "cI": {
        "id": "BBa_C0051", 
        "role": "CDS", 
        "info": "Lambda cI repressor protein coding sequence"
    },
    "AraC_activator": {
        "id": "BBa_C0080",
        "role": "CDS",
        "info": "AraC activator protein (full-length)"
    },
    "LuxR": {
        "id": "BBa_C0062",
        "role": "CDS",
        "info": "LuxR quorum sensing regulator"
    }
}

# Each logical gate currently maps to one predefined biological implementation.
# This is only the first version of the compiler.
# Different implementations can be added later.
GATES_DB = {
    "NOT": [
        {"id": "BBa_R0040", "role": "promoter", "info": "TetR repressible promoter (pTet)"},
        {"id": "BBa_B0034", "role": "RBS",      "info": "Strong RBS"},
    ],
    "AND": [
        {"id": "BBa_K1847000", "role": "promoter", "info": "AND gate promoter (Split-activator responsive)"},
        {"id": "BBa_B0034",    "role": "RBS",      "info": "Strong RBS"},
    ],
    "OR": [
        {"id": "BBa_K1847001", "role": "promoter", "info": "OR gate dual promoter"},
        {"id": "BBa_B0034",    "role": "RBS",      "info": "Strong RBS"},
    ],
    "NAND": [
        {"id": "BBa_K1847002", "role": "promoter", "info": "NAND gate promoter (repressor cascade)"},
        {"id": "BBa_B0034",    "role": "RBS",      "info": "Strong RBS"},
    ],
    "NOR": [
        {"id": "BBa_K1847003", "role": "promoter", "info": "NOR gate dual repressor promoter"},
        {"id": "BBa_B0034",    "role": "RBS",      "info": "Strong RBS"},
    ]
}
# Reporter proteins are treated separately because they represent the final observable output.
REPORTERS = {
    "GFP": {
        "id": "BBa_E0040", 
        "role": "CDS", 
        "info": "Green Fluorescent Protein reporter"
    },
    "RFP": {
        "id": "BBa_E0010", 
        "role": "CDS", 
        "info": "Red Fluorescent Protein reporter"
    },
    "BFP": {
        "id": "BBa_E0020",
        "role": "CDS",
        "info": "Blue Fluorescent Protein reporter"
    },
    "YFP": {
        "id": "BBa_E0030",
        "role": "CDS",
        "info": "Yellow Fluorescent Protein reporter"
    },
    "mCherry": {
        "id": "BBa_J06504",
        "role": "CDS",
        "info": "mCherry red fluorescent reporter"
    },
    "LacZ": {
        "id": "BBa_I732005",
        "role": "CDS",
        "info": "Beta-galactosidase reporter"
    }
}

ADDITIONAL_PARTS = {
    "BBa_B0032": {"role": "RBS",      "info": "Medium strength RBS"},
    "BBa_R0010": {"role": "promoter", "info": "LacI repressible promoter (pLac)"},
    "BBa_R0051": {"role": "promoter", "info": "cI repressible promoter (pR)"},
    "BBa_I0500": {"role": "promoter", "info": "AraC inducible promoter (pBad)"},
    "BBa_R0062": {"role": "promoter", "info": "LuxR inducible promoter (plux)"},
    "BBa_B0010": {"role": "terminator", "info": "T7 terminator"},
    "BBa_B0012": {"role": "terminator", "info": "Double terminator (reverse)"},
}

REGULATORY_MAP = {
    "TetR_protein": {"target_promoter": "BBa_R0040", "action": "repress"},
    "aTc_inducer": {"target_protein": "TetR", "action": "inhibit_repressor"},
    "LacI_protein": {"target_promoter": "BBa_R0010", "action": "repress"},
    "IPTG_inducer": {"target_protein": "LacI", "action": "inhibit_repressor"},
    "AraC_protein": {"target_promoter": "BBa_I0500", "action": "activate"},
    "LuxR_protein": {"target_promoter": "BBa_R0062", "action": "activate"},
    "cI_protein": {"target_promoter": "BBa_R0051", "action": "repress"},
}

if __name__ == "__main__":
    # Quick check to make sure the database contains the expected records.
    print("--- BioBrick Parts Database Test ---")

    repressor_name = "TetR"
    if repressor_name in BIOMOLECULES:
        part_info = BIOMOLECULES[repressor_name]
        print(f"Intermediate Repressor [{repressor_name}] -> iGEM ID: {part_info['id']} ({part_info['info']})")

    print("\nNOT Gate Backbone Parts:")
    for part in GATES_DB["NOT"]:
        print(f"  Role: {part['role']:<12} -> iGEM ID: {part['id']}")