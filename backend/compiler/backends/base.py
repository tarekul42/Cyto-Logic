from abc import ABC, abstractmethod

from ..cir import CircuitIR


class Backend(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def generate(self, cir: CircuitIR) -> str | dict:
        pass
