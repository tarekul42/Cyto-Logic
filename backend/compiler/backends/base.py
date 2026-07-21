from abc import ABC, abstractmethod


class Backend(ABC):
    @abstractmethod
    def name(self):
        pass

    @abstractmethod
    def generate(self, cir):
        pass
