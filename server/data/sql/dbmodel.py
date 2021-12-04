from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import registry

mapper_registry = registry()
metadata = mapper_registry.metadata

Base = mapper_registry.generate_base()


class Language(Base):
    __tablename__ = "language"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(8))
    two_letters_iso_code = Column(String(2))
    three_letters_iso_code = Column(String(3))
    english_name = Column(String(50))


class Country(Base):
    __tablename__ = "country"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(2))
    english_name = Column(String(100))
