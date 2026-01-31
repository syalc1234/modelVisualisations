import json

from fastapi import FastAPI
from pydantic import BaseModel

from fastapi.middleware.cors import CORSMiddleware

from functions.HestonModel import generate_heston_model

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
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
    S = 100
    kappa = 4
    theta = 0.02
    V_0 = 0.02
    xi = 0.9
    r = 0.02
    paths = 3
    steps = 2000
    T = 1
    rho = -0.8
    prices, sigmas = generate_heston_model(S, T, r, kappa, theta, V_0, rho, xi, steps, paths)
    return {"price": prices.tolist(), "sigma": sigmas.tolist()}
