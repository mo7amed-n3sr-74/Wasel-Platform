import axios from "axios";

let accessToken: string = '';
let accessTokenExp: number = 0;


export function setAccessToken(token: string) {
    accessToken = token;

    try {
        const { exp }: { exp: number } = JSON.parse(atob(token.split('.')[1]));
        accessTokenExp = exp;
    } catch (err) {
        console.log(err);
        accessTokenExp = 0;
    }
}

export function getAccessToken() {
    return accessToken;
}

function isExpired() {
    return Date.now() >= accessTokenExp - 2000
}

let refreshPromise: boolean | null = null;

async function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/auth/refresh`,
            {},
            {
                withCredentials: true
            }
        )
        .then((res) => {
            setAccessToken(res.data);
            return res.data;
        })
        .finally(() => {
            refreshPromise = null;
        })
    }

    return refreshPromise;
}

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true
});


api.interceptors.request.use( 
    async (config) => {
        if (accessToken && isExpired()) {
            await refreshAccessToken();
        }

        if (accessToken) {
            config.headers.Authorization = `Bearer ${getAccessToken()}`
        }

        return config
    },
    (err) => err
);

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;

            try {
                await refreshAccessToken();
                original.headers.Authorization = `Bearer ${getAccessToken()}`
                return api(original);
            } catch (err) {
                console.log("Failed to refresh, Logging out...");
                return Promise.reject(err);
            }
        } 

        return Promise.reject(error);
    }
)

export default api;
