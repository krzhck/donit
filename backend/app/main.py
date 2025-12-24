from typing import List

from typing_extensions import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import Base, SessionLocal, engine

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbDep = Annotated[Session, Depends(get_db)]


@app.get("/api/todos", response_model=List[schemas.TodoResponse])
def get_todos(db: DbDep):
    return crud.get_todos(db)


@app.post(
    "/api/todos",
    response_model=schemas.TodoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_todo(todo_in: schemas.TodoCreate, db: DbDep):
    return crud.create_todo(db, todo_in)


@app.patch("/api/todos/{todo_id}", response_model=schemas.TodoResponse)
def update_todo(todo_id: int, todo_update: schemas.TodoUpdate, db: DbDep):
    todo = crud.get_todo(db, todo_id)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
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