import { privateHttpClient } from "../client/HttpClient";

class UserService {
	logout() {
		return privateHttpClient.post("/auth/signout");
	}
}

export const userService = new UserService();
