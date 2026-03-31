import { privateHttpClient } from "../client/HttpClient";

class UserService {

	userShipments() {
		return privateHttpClient.get('/user/shipments')
	}

	logout() {
		return privateHttpClient.post("/auth/signout");
	}
}

export const userService = new UserService();
