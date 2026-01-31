import numpy as np


def generate_heston_model(S, T, r, kappa, theta, V_0, rho, xi, steps, number_of_iterations):
    dt = T / steps
    size = (number_of_iterations, steps)
    prices = np.zeros(size)
    sigmas = np.zeros(size)
    S_t = S
    V_t = V_0
    covariance = np.array([[1, rho], [rho, 1]])

    for i in range(steps):
        W_t = np.random.multivariate_normal(np.array([0, 0]), covariance, size=number_of_iterations)

        S_t = S_t + r * S_t * dt + np.sqrt(V_t) * S_t * np.sqrt(dt) * W_t[:, 0]
        V_t = np.abs(V_t + kappa * (theta - V_t) * dt + xi * np.sqrt(V_t) * np.sqrt(dt) * W_t[:, 1])
        prices[:, i] = S_t
        sigmas[:, i] = V_t

    return prices, sigmas
