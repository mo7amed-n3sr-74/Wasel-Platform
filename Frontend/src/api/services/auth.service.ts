import { publicHttpClient, privateHttpClient } from "../client/HttpClient";

class AuthService {

	refresh() {
		return publicHttpClient.post(`/auth/refresh`);
	}

	me() {
		return privateHttpClient.get("/user/me");
	}

	signup(data: { role: string | null, username: string, email: string, password: string }) {
		return publicHttpClient.post(`/auth/signup`, data)
	}

	signin(data: { email: string, password: string })  {
		return publicHttpClient.post(`/auth/signin`, data);
	}

	signout() {
		return publicHttpClient.post(`/auth/signout`);
	}

	verifyUsername(data: { username: string }) {
		return publicHttpClient.post('/auth/username-verify', data)
	}

	forgetPassword(data: { email: string }) {
		return publicHttpClient.post('/auth/forget-password', data);
	}

	verifyOtp(data: { email: string, otp: string }) {
		return publicHttpClient.post('/auth/otp-verify', data)
	}
}

export const authService = new AuthService();
