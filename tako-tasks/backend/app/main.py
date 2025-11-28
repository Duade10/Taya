from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import access, tasks, auth, slack

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Tako Tasks")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"]
    ,
    allow_headers=["*"],
)

app.include_router(access.router)
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(slack.router)


@app.get("/")
def index():
    return {"service": "tako-tasks", "status": "ok"}
