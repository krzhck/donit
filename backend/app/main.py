from typing import List

from typing_extensions import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import Base, SessionLocal, engine
from .config import settings
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    # 初始化默认inbox分类
    db = SessionLocal()
    try:
        existing_inbox = crud.get_category_by_name(db, "inbox")
        if not existing_inbox:
            crud.create_category(db, schemas.CategoryCreate(name="inbox"))
    finally:
        db.close()


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbDep = Annotated[Session, Depends(get_db)]


# Category API
@app.get("/api/categories", response_model=List[schemas.CategoryResponse])
def get_categories(db: DbDep):
    return crud.get_categories(db)


@app.post(
    "/api/categories",
    response_model=schemas.CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_category(category_in: schemas.CategoryCreate, db: DbDep):
    existing = crud.get_category_by_name(db, category_in.name)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category already exists")
    return crud.create_category(db, category_in)


@app.patch("/api/categories/{category_id}", response_model=schemas.CategoryResponse)
def update_category(category_id: int, category_update: schemas.CategoryUpdate, db: DbDep):
    category = crud.get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if category_id == 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify inbox category")
    # 检查新名称是否已存在
    if category_update.name:
        existing = crud.get_category_by_name(db, category_update.name)
        if existing and existing.id != category_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category name already exists")
    if not category_update.model_dump(exclude_unset=True):
        return category
    return crud.update_category(db, category, category_update)


@app.delete("/api/categories/{category_id}")
def delete_category(category_id: int, db: DbDep):
    category = crud.get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if category_id == 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete inbox category")
    crud.delete_category(db, category)
    return {"status": "deleted"}


# Todo API
@app.get("/api/todos", response_model=List[schemas.TodoResponse])
def get_todos(db: DbDep):
    return crud.get_todos(db)

@app.post(
    "/api/todos",
    response_model=schemas.TodoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_todo(todo_in: schemas.TodoCreate, db: DbDep):
    # 如果指定了category_id，验证category存在
    if todo_in.category_id:
        category = crud.get_category(db, todo_in.category_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return crud.create_todo(db, todo_in)


@app.patch("/api/todos/{todo_id}", response_model=schemas.TodoResponse)
def update_todo(todo_id: int, todo_update: schemas.TodoUpdate, db: DbDep):
    todo = crud.get_todo(db, todo_id)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    # 如果更新category_id，验证category存在
    if todo_update.category_id:
        category = crud.get_category(db, todo_update.category_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if not todo_update.model_dump(exclude_unset=True):
        return todo
    return crud.update_todo(db, todo, todo_update)


@app.delete("/api/todos/{todo_id}")
def delete_todo(todo_id: int, db: DbDep):
    todo = crud.get_todo(db, todo_id)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    crud.delete_todo(db, todo)
    return {"status": "deleted"}
