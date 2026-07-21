import pytest
from compiler.cir import CircuitIR
from compiler.backends.dna_backend import DNABackend


class TestDNABackend:
    def test_name(self):
        assert DNABackend().name == "DNA"

    def test_empty_circuit_returns_fasta(self):
        ir = CircuitIR()
        backend = DNABackend()
        fasta = backend.generate(ir)
        assert fasta.startswith(">")

    def test_single_part(self):
        ir = CircuitIR()
        ir.add_part("BBa_E0040", "CDS", "GFP")
        backend = DNABackend()
        fasta = backend.generate(ir, circuit_name="test")
        assert ">test" in fasta
        assert ">BBa_E0040" in fasta
        assert "ATGCGT" in fasta

    def test_multiple_parts_concatenated(self):
        ir = CircuitIR()
        ir.add_part("BBa_R0040", "promoter", "pTet")
        ir.add_part("BBa_B0034", "RBS", "RBS")
        ir.add_part("BBa_E0040", "CDS", "GFP")
        ir.add_part("BBa_B0015", "terminator", "terminator")
        backend = DNABackend()
        fasta = backend.generate(ir, circuit_name="construct")
        assert ">construct" in fasta
        assert ">BBa_R0040" in fasta
        assert ">BBa_B0034" in fasta
        assert ">BBa_E0040" in fasta
        assert ">BBa_B0015" in fasta

    def test_unknown_part_uses_placeholder(self):
        ir = CircuitIR()
        ir.add_part("BBa_UNKNOWN", "CDS", "Unknown")
        backend = DNABackend()
        fasta = backend.generate(ir)
        assert "N" in fasta

    def test_generate_fasta_alias(self):
        ir = CircuitIR()
        ir.add_part("BBa_E0040", "CDS", "GFP")
        backend = DNABackend()
        fasta = backend.generate_fasta(ir)
        assert fasta.startswith(">")

    def test_registry_contains_dna(self):
        from compiler.backends.registry import get, list_backends
        assert "DNA" in list_backends()
        backend = get("DNA")
        assert backend is not None
        assert backend.name == "DNA"

    def test_parts_deduplication_respected(self):
        ir = CircuitIR()
        ir.add_part("BBa_E0040", "CDS", "GFP")
        ir.add_part("BBa_E0040", "CDS", "GFP")
        backend = DNABackend()
        fasta = backend.generate(ir)
        assert fasta.count(">BBa_E0040") == 1

    def test_circuit_name_in_construct_header(self):
        ir = CircuitIR()
        ir.add_part("BBa_E0040", "CDS", "GFP")
        backend = DNABackend()
        fasta = backend.generate(ir, circuit_name="my_circuit_v2")
        assert ">my_circuit_v2" in fasta
