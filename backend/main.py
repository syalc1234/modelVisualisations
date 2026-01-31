from fastapi import FastAPI
from pydantic import BaseModel

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:3000",
]


class ItemHeston(BaseModel):
    Kappa: str | None
    Theta: str | None
    Rho: str | None
    V0: str | None


class FBM(BaseModel):
    T: str | None
    H: str | None
    N: str | None
    S0: str | None


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/hello/")
async def say_hello(name: ItemHeston):
    print(name)
    return {"message"}
