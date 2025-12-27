from typing import List

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    cors_origins: List[str] = ["http://localhost:5173"]

settings = Settings()