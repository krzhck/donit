from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, func

from .database import Base


class Todo(Base):
	__tablename__ = "todos"

	id = Column(Integer, primary_key=True, index=True)
	title = Column(String(100), nullable=False)
	description = Column(Text, nullable=True)
	is_completed = Column(Boolean, nullable=False, server_default="0")
	category = Column(String(50), nullable=False, server_default="General")
	priority = Column(Integer, nullable=False, server_default="2")
	created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
	updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
