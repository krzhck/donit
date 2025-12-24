from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TodoBase(BaseModel):
    title: str = Field(..., max_length=100)
    description: Optional[str] = None
    is_completed: bool = False
    category: str = Field("General", max_length=50)
    priority: int = Field(2, ge=1, le=3)


class TodoCreate(TodoBase):
    pass


class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    category: Optional[str] = Field(None, max_length=50)
    priority: Optional[int] = Field(None, ge=1, le=3)


class TodoResponse(TodoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
