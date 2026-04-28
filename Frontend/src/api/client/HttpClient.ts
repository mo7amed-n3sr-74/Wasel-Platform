import axios from "axios";

// Private
class PrivateHttpClient {
	private instance;
	public accessToken: string | null = null;
	public accessTokenExp: number = 0;
	public refreshPromise: Promise<string> | null = null;
	public logoutCallback?: () => void;
	// private accessToken

	constructor() {
		this.instance = axios.create({
			baseURL: import.meta.env.VITE_BACKEND_URL,
			withCredentials: true,
		});

		this.setupInterceptors();
	}

	setLogoutCallback(callback: () => void) {
		this.logoutCallback = callback;
	}

	setAccessToken(token: string) {
		this.accessToken = token;

		try {
			const { exp }: { exp: number } = JSON.parse(
				atob(this.accessToken.split(".")[1]),
			);
			this.accessTokenExp = exp;
		} catch (err) {
			console.log(err);
			this.accessTokenExp = 0;
		}
	}

	private isExpired() {
		return Date.now() >= this.accessTokenExp * 1000 - 10000;
	}

	private async refreshAccessToken() {
		if (this.refreshPromise) return this.refreshPromise;

		let attempts = 0;
		const maxAttempts = 3;
		const baseDelay = 1000; // 1 second

		while (attempts < maxAttempts) {
			try {
				this.refreshPromise = axios
					.post(
						`${import.meta.env.VITE_BACKEND_URL}/auth/refresh`,
						{},
						{
							withCredentials: true,
						},
					)
					.then((res) => {
						this.setAccessToken(res.data);
						return res.data;
					});
				return await this.refreshPromise;
			} catch (error) {
				attempts++;
				if (attempts >= maxAttempts) {
					this.logoutCallback?.();
					throw error;
				}
				const delay = baseDelay * Math.pow(2, attempts - 1);
				await new Promise((resolve) =>
					setTimeout(resolve, delay), 
				);
			} finally {
				this.refreshPromise = null;
			}
		}
	}

	private setupInterceptors() {
		// On Req
		this.instance.interceptors.request.use(
			async (config) => {
				if (this.accessToken && this.isExpired()) {
					try {
						await this.refreshAccessToken();
					} catch (error) {
						this.logoutCallback?.();
						throw error;
					}
				}

				if (this.accessToken) {
					config.headers.Authorization = `Bearer ${this.accessToken}`;
				}

				return config;
			},
			(err) => err,
		);

		// On Res
		this.instance.interceptors.response.use(
			(res) => res,
			async (err) => {
				const original = err.config;

				if (err.response?.status === 401 && !original._retry) {
					original._retry = true;

					try {
						await this.refreshAccessToken();
						original.headers.Authorization = `Bearer ${this.accessToken}`;
						return this.instance(original);
					} catch (refreshErr) {
						console.log(
							"Failed to refresh, Logging out...",
						);
						this.logoutCallback?.();
						return Promise.reject(refreshErr);
					}
				}

				return Promise.reject(err);
			},
		);
	}

	// Request actions
	get(url: string) {
		return this.instance.get(url);
	}

	post(url: string, data?: Record<string, unknown>) {
		return this.instance.post(url, data);
	}

	put(url: string, data: Record<string, unknown>) {
		return this.instance.put(url, data);
	}

	delete(url: string) {
		return this.instance.delete(url);
	}
}
export const privateHttpClient = new PrivateHttpClient();

// Public
class PublicHttpClient {
	private instance;

	constructor() {
		this.instance = axios.create({
			baseURL: import.meta.env.VITE_BACKEND_URL,
			withCredentials: true,
		});
	}

	get(url: string) {
		return this.instance.get(url);
	}

	post(url: string, data?: Record<string, unknown>) {
		return this.instance.post(url, data);
	}
}
export const publicHttpClient = new PublicHttpClient();
