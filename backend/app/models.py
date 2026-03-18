from dataclasses import dataclass


@dataclass(frozen=True)
class User:
    username: str
    password: str


@dataclass(frozen=True)
class Project:
    id: int
    name: str
    description: str
    owner_username: str
    created_at: str
