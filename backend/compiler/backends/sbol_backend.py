import sbol2
from .base import Backend


class SBOLBackend(Backend):
    def __init__(self, homespace="http://cytologic.org"):
        self._homespace = homespace

    @property
    def name(self):
        return "SBOL"

    def generate(self, cir, circuit_name="untitled"):
        sbol2.setHomespace(self._homespace)
        doc = sbol2.Document()
        safe_name = circuit_name.replace(" ", "_")

        main_region = sbol2.ComponentDefinition(safe_name)
        main_region.roles = ["http://identifiers.org/so/SO:0000804"]
        doc.addComponentDefinition(main_region)

        so_mapping = {
            "promoter": sbol2.SO_PROMOTER,
            "RBS": "http://identifiers.org/SO:0000139",
            "CDS": sbol2.SO_CDS,
            "terminator": "http://identifiers.org/SO:0000141",
        }

        for idx, item in enumerate(cir.parts_deduplicated()):
            unique_id = (
                f"{safe_name}_{item.get('id', 'part')}_{idx}"
                .replace("-", "_")
            )
            sub_part = sbol2.ComponentDefinition(unique_id)
            part_role = so_mapping.get(item.get("role"), sbol2.SO_MISC)
            sub_part.roles = [part_role]
            doc.addComponentDefinition(sub_part)

            sub_component = sbol2.Component(f"element_{idx}")
            sub_component.definition = sub_part.identity
            main_region.components.add(sub_component)

        return doc

    def generate_xml(self, cir, circuit_name="untitled"):
        doc = self.generate(cir, circuit_name)
        return doc.writeString()
