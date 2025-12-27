from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    name: str = Field(..., max_length=50)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)


class CategoryResponse(CategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class TodoBase(BaseModel):
    title: str = Field(..., max_length=100)
    description: Optional[str] = None
    is_completed: bool = False
    category_id: int = Field(1, ge=1)
    priority: int = Field(2, ge=1, le=3)
    task_date: Optional[date] = None


class TodoCreate(BaseModel):
    title: str = Field(..., max_length=100)
    description: Optional[str] = None
    is_completed: bool = False
    category_id: Optional[int] = Field(None, ge=1)
    priority: int = Field(2, ge=1, le=3)
    task_date: Optional[date] = None


class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    category_id: Optional[int] = Field(None, ge=1)
    priority: Optional[int] = Field(None, ge=1, le=3)
    task_date: Optional[date] = None


class TodoResponse(TodoBase):
    id: int
    category: CategoryResponse
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
