import json

from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel

from fastapi.middleware.cors import CORSMiddleware

from functions.heston2dpde import heston_2d_pde
from functions.fracBM import generate_frac_bm
from functions.HestonModel import generate_heston_model

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]


class HestonModel(BaseModel):
    S: str | None
    Kappa: str | None
    Theta: str | None
    Rho: str | None
    V0: str | None
    Xi: str | None
    Sigma: str | None
    paths: str | None
    steps: str | None


class FBM(BaseModel):
    T: str | None
    H: str | None
    N: str | None
    nPaths: str | None


class Heston2dPDE(BaseModel):
    Kappa: str | None
    Theta: str | None
    Sigma: str | None
    Rho: str | None
    r: str | None
    q: str | None
    K: str | None
    T: str | None
    NAS: str | None
    NVS: str | None
    NTS: str | None


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


@app.post("/heston/")
async def heston(name: HestonModel):
    print(name.Kappa, name.Theta, name.Rho, name.V0)
    T = 1
    prices, sigmas = generate_heston_model(float(name.S), T, float(name.Sigma), float(name.Kappa), float(name.Theta),
                                           float(name.V0), float(name.Rho), float(name.Xi), int(name.steps),
                                           int(name.paths))
    return {"price": prices.tolist(), "sigma": sigmas.tolist()}


@app.post("/fBM/")
async def fbm(name: FBM):
    print(name.T, name.H, name.N, name.nPaths)
    prices = generate_frac_bm(int(name.T), float(name.H), int(name.N), int(name.nPaths))
    return {"price": prices.tolist()}

@app.post("/heston2d/")
async def heston2d(name: Heston2dPDE):
    u2 = heston_2d_pde(int(name.Kappa), float(name.Theta), float(name.Sigma), float(name.Rho), float(name.r), float(name.q), int(name.K), int(name.T), int(name.NAS), int(name.NVS), int(name.NTS))
    return jsonable_encoder({"grid": u2.tolist()})

