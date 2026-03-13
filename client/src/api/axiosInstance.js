import axios from 'axios';
import useAuthStore from '../store/authStore.js';

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

const resolveApiBase = (configuredBase) => {
    if (!configuredBase || !import.meta.env.DEV) {
        return configuredBase || '/api/v1';
    }

    try {
        const parsedUrl = new URL(configuredBase, globalThis.location?.origin);
        const currentHostname = globalThis.location?.hostname;

        if (LOCAL_HOSTNAMES.has(parsedUrl.hostname) && LOCAL_HOSTNAMES.has(currentHostname || '')) {
            return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}` || '/api/v1';
        }

        return parsedUrl.toString();
    } catch {
        return configuredBase;
    }
};

const API_BASE = resolveApiBase(import.meta.env.VITE_API_BASE_URL?.trim());
const AUTH_BYPASS_ROUTES = [/\/auth\/refresh$/, /\/auth\/login$/, /\/auth\/logout$/];

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

let refreshRequest = null;

const shouldBypassRefresh = (requestUrl = '') => AUTH_BYPASS_ROUTES.some((pattern) => pattern.test(requestUrl));

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config ?? {};

        // If the original request was for login, logout, or refresh itself, don't intercept, just reject
        if (shouldBypassRefresh(originalRequest.url)) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                refreshRequest ??= api.post('/auth/refresh');
                await refreshRequest;
                return api(originalRequest);
            } catch (refreshError) {
                useAuthStore.getState().logout();

                // Only hard-redirect if we aren't already on the login page to prevent infinite reload loops
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            } finally {
                refreshRequest = null;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
