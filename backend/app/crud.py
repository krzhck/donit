from typing import List, Optional

from sqlalchemy.orm import Session

from . import models, schemas


def get_todos(db: Session) -> List[models.Todo]:
    return db.query(models.Todo).order_by(models.Todo.created_at.desc()).all()


def get_todo(db: Session, todo_id: int) -> Optional[models.Todo]:
    return db.query(models.Todo).filter(models.Todo.id == todo_id).first()


def create_todo(db: Session, todo_in: schemas.TodoCreate) -> models.Todo:
    todo = models.Todo(**todo_in.model_dump())
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


def update_todo(db: Session, todo: models.Todo, updates: schemas.TodoUpdate) -> models.Todo:
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(todo, field, value)
    db.commit()
    db.refresh(todo)
    return todo


def delete_todo(db: Session, todo: models.Todo) -> None:
    db.delete(todo)
    db.commit()
