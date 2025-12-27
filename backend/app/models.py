from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from .database import Base


class Category(Base):
	__tablename__ = "categories"

	id = Column(Integer, primary_key=True, index=True)
	name = Column(String(50), unique=True, nullable=False)
	todos = relationship("Todo", back_populates="category")


class Todo(Base):
	__tablename__ = "todos"

	id = Column(Integer, primary_key=True, index=True)
	title = Column(String(100), nullable=False)
	description = Column(Text, nullable=True)
	is_completed = Column(Boolean, nullable=False, server_default="0")
	category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, server_default="1")
	priority = Column(Integer, nullable=False, server_default="2")
	task_date = Column(Date, nullable=True)
	created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
	updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
	category = relationship("Category", back_populates="todos")