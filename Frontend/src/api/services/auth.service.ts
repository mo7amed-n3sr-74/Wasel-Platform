import { publicHttpClient, privateHttpClient } from "../client/HttpClient";

class AuthService {

	refresh() {
		return publicHttpClient.post(`/auth/refresh`);
	}

	me() {
		return privateHttpClient.get("/user/me");
	}

	signin(data: { email: string, password: string })  {
		return publicHttpClient.post(`/auth/signin`, data);
	}

	signout() {
		return publicHttpClient.post(`/auth/signout`);
	}
}

export const authService = new AuthService();
