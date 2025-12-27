from typing import List, Optional

from sqlalchemy.orm import Session

from . import models, schemas


# Category CRUD
def create_category(db: Session, category_in: schemas.CategoryCreate) -> models.Category:
    category = models.Category(**category_in.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def get_category(db: Session, category_id: int) -> Optional[models.Category]:
    return db.query(models.Category).filter(models.Category.id == category_id).first()


def get_category_by_name(db: Session, name: str) -> Optional[models.Category]:
    return db.query(models.Category).filter(models.Category.name == name).first()


def get_categories(db: Session) -> List[models.Category]:
    return db.query(models.Category).all()


def update_category(db: Session, category: models.Category, updates: schemas.CategoryUpdate) -> models.Category:
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category: models.Category) -> None:
    db.delete(category)
    db.commit()


# Todo CRUD
def get_todos(db: Session) -> List[models.Todo]:
    return db.query(models.Todo).order_by(models.Todo.created_at.desc()).all()


def get_todo(db: Session, todo_id: int) -> Optional[models.Todo]:
    return db.query(models.Todo).filter(models.Todo.id == todo_id).first()


def create_todo(db: Session, todo_in: schemas.TodoCreate) -> models.Todo:
    todo_data = todo_in.model_dump(exclude_unset=True)
    # 默认值inbox (id=1)
    if "category_id" not in todo_data or todo_data["category_id"] is None:
        todo_data["category_id"] = 1
    todo = models.Todo(**todo_data)
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
