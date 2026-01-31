import numpy as np
from scipy.linalg import sqrtm


def co_var(s, t, h):
    return (np.abs(t) ** (2 * h) + np.abs(s) ** (2 * h) - np.abs(t - s) ** (2 * h)) / 2.0


def generate_frac_bm(T, H, N, nPaths):
    """
    T = Time in yrs default to 1.0
    N = TimeStep
    H = Hurst param
    """
    ts = np.linspace(0.00, T, N + 1)
    n = ts.size
    i, j = np.meshgrid(ts, ts, indexing="xy")
    auto_corr = co_var(i, j, H)

    sqrt_auto_corr = sqrtm(auto_corr)
    frac_bm_paths = np.zeros((nPaths, n))
    for k in range(nPaths):
        v = np.random.randn(n)
        u = sqrt_auto_corr @ v
        frac_bm_paths[k, :] = u  # assign, no concatenate

    return frac_bm_paths
