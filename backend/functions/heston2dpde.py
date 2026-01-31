import numpy as np
import scipy as sp


def build_derivatives_2d(NAS, NVS, ds, dv):
    N = NAS * NVS
    DS = sp.sparse.lil_matrix((N, N))
    D2S = sp.sparse.lil_matrix((N, N))
    DV = sp.sparse.lil_matrix((N, N))
    D2V = sp.sparse.lil_matrix((N, N))
    DSV = sp.sparse.lil_matrix((N, N))

    def idx(i, j):
        # Flattening
        return i + j * NAS

    for j in range(NVS):
        for i in range(NAS):
            k = idx(i, j)
            # First derivative S
            if 1 <= i < NAS - 1:
                DS[k, idx(i - 1, j)] = -0.5 / ds
                DS[k, idx(i + 1, j)] = 0.5 / ds
            elif i == 0:
                DS[k, idx(i, j)] = -1.0 / ds
                DS[k, idx(i + 1, j)] = 1.0 / ds
            elif i == NAS - 1:
                DS[k, idx(i - 1, j)] = -1.0 / ds
                DS[k, idx(i, j)] = 1.0 / ds

            # Second derivative S
            if 1 <= i < NAS - 1:
                D2S[k, idx(i - 1, j)] = 1.0 / ds ** 2
                D2S[k, idx(i, j)] = -2.0 / ds ** 2
                D2S[k, idx(i + 1, j)] = 1.0 / ds ** 2
            elif i == 0:
                D2S[k, idx(i, j)] = 1.0 / ds ** 2
                D2S[k, idx(i + 1, j)] = -2.0 / ds ** 2
                D2S[k, idx(i + 2, j)] = 1.0 / ds ** 2
            elif i == NAS - 1:
                D2S[k, idx(i - 2, j)] = 1.0 / ds ** 2
                D2S[k, idx(i - 1, j)] = -2.0 / ds ** 2
                D2S[k, idx(i, j)] = 1.0 / ds ** 2

            # First derivative v
            if 1 <= j < NVS - 1:
                DV[k, idx(i, j - 1)] = -0.5 / dv
                DV[k, idx(i, j + 1)] = 0.5 / dv
            elif j == 0:
                DV[k, idx(i, j)] = -1.0 / dv
                DV[k, idx(i, j + 1)] = 1.0 / dv
            elif j == NVS - 1:
                DV[k, idx(i, j - 1)] = -1.0 / dv
                DV[k, idx(i, j)] = 1.0 / dv

            # Second derivative
            if 1 <= j < NVS - 1:
                D2V[k, idx(i, j - 1)] = 1.0 / dv ** 2
                D2V[k, idx(i, j)] = -2.0 / dv ** 2
                D2V[k, idx(i, j + 1)] = 1.0 / dv ** 2
            elif j == 0:
                D2V[k, idx(i, j)] = 1.0 / dv ** 2
                D2V[k, idx(i, j + 1)] = -2.0 / dv ** 2
                D2V[k, idx(i, j + 2)] = 1.0 / dv ** 2
            elif j == NVS - 1:
                D2V[k, idx(i, j - 2)] = 1.0 / dv ** 2
                D2V[k, idx(i, j - 1)] = -2.0 / dv ** 2
                D2V[k, idx(i, j)] = 1.0 / dv ** 2

            # Cross derivative (central differences)
            if (1 <= i < NAS - 1) and (1 <= j < NVS - 1):
                DSV[k, idx(i - 1, j - 1)] = 1.0 / (4 * ds * dv)
                DSV[k, idx(i + 1, j + 1)] = 1.0 / (4 * ds * dv)
                DSV[k, idx(i - 1, j + 1)] = -1.0 / (4 * ds * dv)
                DSV[k, idx(i + 1, j - 1)] = -1.0 / (4 * ds * dv)

    return DS.tocsr(), D2S.tocsr(), DV.tocsr(), D2V.tocsr(), DSV.tocsr()


# Heston model parameters
def heston_2d_pde(kappa, theta, sigma, rho, r, q, K, T, NAS, NVS, NTS):
    """
    kappa = 5
    theta = 0.04
    sigma = 0.15
    rho = -0.9
    r = 0.02
    q = 0.05
    K = 100
    T = 1.0

    NAS = 100  # number of asset steps
    NVS = 100  # number of volatility steps
    NTS = 200  # number of time steps
    """
    Smin = 0.0
    Smax = 2 * K
    Vmin = 0.0
    Vmax = 1
    tau_min = 0.0
    tau_max = T

    ds = (Smax - Smin) / (NAS - 1)
    dv = (Vmax - Vmin) / (NVS - 1)
    dt = (tau_max - tau_min) / NTS

    S = np.linspace(Smin, Smax, NAS)
    V = np.linspace(Vmin, Vmax, NVS)

    # Here I am creating 2d grid from 1d spot and 1d volatility gird
    S2d, V2d = np.meshgrid(S, V, indexing='ij')
    N = NAS * NVS

    S_flat = S2d.ravel(order='F')
    V_flat = V2d.ravel(order='F')

    DS, D2S, DV, D2V, DSV = build_derivatives_2d(NAS, NVS, ds, dv)

    Sdiag = sp.sparse.diags(S_flat, 0)
    S2diag = sp.sparse.diags(S_flat ** 2, 0)
    Vdiag = sp.sparse.diags(V_flat, 0)
    thetaV = sp.sparse.diags(theta - V_flat, 0)
    I = sp.sparse.eye(N)

    A0 = rho * sigma * Sdiag * Vdiag * DSV
    A1 = (r - q) * Sdiag * DS + 0.5 * Vdiag * S2diag * D2S - 0.5 * r * I
    A2 = kappa * thetaV * DV + 0.5 * sigma ** 2 * Vdiag * D2V - 0.5 * r * I

    theta_ADI = 0.5  # 0.5 for Crank Nicholson
    A_S_mat = I - theta_ADI * dt * A1
    A_V_mat = I - theta_ADI * dt * A2
    B_mat = I + (1 - theta_ADI) * dt * (A0 + A1 + A2)

    A_S_mat = A_S_mat.tocsc()
    A_V_mat = A_V_mat.tocsc()
    B_mat = B_mat.tocsc()

    A_S_factor = sp.sparse.linalg.splu(A_S_mat)
    A_V_factor = sp.sparse.linalg.splu(A_V_mat)

    U_terminal_2d = np.maximum(S2d - K, 0)
    U = U_terminal_2d.ravel(order='F')

    U_n = U.copy()
    for n in range(NTS):
        Y0 = A_S_factor.solve(U_n)
        Y1 = sp.sparse.linalg.spsolve(I - 0.5 * dt * A1, Y0 - 0.5 * dt * A1 @ U_n)
        Y2 = sp.sparse.linalg.spsolve(I - 0.5 * dt * A2, Y1 - 0.5 * dt * A2 @ U_n)
        U_n = Y2

        t_current = T - (n + 1) * dt
        for j in range(NVS):
            idx_low = 0 + j * NAS
            idx_high = (NAS - 1) + j * NAS
            U_n[idx_low] = 0.0
            U_n[idx_high] = Smax - K * np.exp(-r * (T - t_current))

        # At v = 0 - zero slope: U_n[i,0] = U_n[i,1]
        for i in range(NAS):
            idx_v0 = i + 0 * NAS
            idx_v1 = i + 1 * NAS
            U_n[idx_v0] = U_n[idx_v1]
        # At v = v_max - zero slope: U_n[i,NVS-1] = U_n[i,NVS-2]
        for i in range(NAS):
            idx_vm = i + (NVS - 1) * NAS
            idx_vm_1 = i + (NVS - 2) * NAS
            U_n[idx_vm] = U_n[idx_vm_1]

    U_final_2d = U_n.reshape((NAS, NVS), order='F')
    return U_final_2d
